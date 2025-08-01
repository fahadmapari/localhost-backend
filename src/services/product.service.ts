import Product, { ProductVariant } from "../models/product.model";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME } from "../config/env";
import { randomUUID } from "crypto";
import path from "path";
import s3Client from "../config/s3";
import { ProductType } from "../schema/product.schema";
import dayjs from "dayjs";
import mongoose from "mongoose";
import slug from "slug";
import { nanoid } from "nanoid";
import { PRODUCT_CODE_KEY_PREFIX } from "../config/constants";
import { EditedProduct } from "../types/product.types";
import _ from "lodash";
import { createError } from "../utils/errorHandlers";

export const updateProductById = async (
  id: string,
  editedProduct: EditedProduct,
  files: Express.Multer.File[]
) => {
  try {
    const oldBaseProduct = await Product.findById(editedProduct.baseProductId);
    const oldProduct = await ProductVariant.findById(editedProduct.id);

    if (oldProduct?.bookingType !== editedProduct.bookingType) {
      // TODO: update base product array
      if (
        (editedProduct.bookingType === "instant" &&
          oldBaseProduct?.tourGuideLanguageInstant?.includes(
            editedProduct.tourGuideLanguage
          )) ||
        (editedProduct.bookingType === "request" &&
          oldBaseProduct?.tourGuideLanguageOnRequest?.includes(
            editedProduct.tourGuideLanguage
          ))
      ) {
        throw createError("Product already exists", 400);
      }

      if (editedProduct.bookingType === "instant") {
        await Product.findByIdAndUpdate(editedProduct.baseProductId, {
          $push: {
            tourGuideLanguageInstant: editedProduct.tourGuideLanguage,
          },
          $pull: {
            tourGuideLanguageOnRequest: editedProduct.tourGuideLanguage,
          },
        });
      } else {
        await Product.findByIdAndUpdate(editedProduct.baseProductId, {
          $push: {
            tourGuideLanguageOnRequest: editedProduct.tourGuideLanguage,
          },
          $pull: {
            tourGuideLanguageInstant: editedProduct.tourGuideLanguage,
          },
        });
      }
    }

    const deletedImages =
      editedProduct?.existingImages && editedProduct?.existingImages.length
        ? _.difference(
            oldBaseProduct?.images,
            editedProduct?.existingImages || []
          )
        : [];

    if (deletedImages.length > 0) {
      await deleteMultipleImages(deletedImages);
      await Product.findByIdAndUpdate(editedProduct.baseProductId, {
        images: editedProduct.existingImages,
      });
    }

    if (files.length > 0) {
      const newUploadedImages = await uploadProductImages(
        files,
        editedProduct.title
      );
      await Product.updateOne(
        { _id: editedProduct.baseProductId },
        {
          $push: {
            images: { $each: newUploadedImages },
          },
        }
      );
    }

    const updatedProduct = await ProductVariant.findByIdAndUpdate(
      id,
      editedProduct
    );

    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

export const findProductById = async (id: string) => {
  const product = await ProductVariant.findById({
    _id: id,
  })
    .populate("baseProduct")
    .lean();
  return product;
};

export const fetchProductMetrics = async () => {
  try {
    const totalProductsCount =
      await ProductVariant.estimatedDocumentCount().lean();
    const totalInstantProductsCount = await ProductVariant.countDocuments({
      bookingType: "instant",
    }).lean();
    const totalOnRequestProductsCount = await ProductVariant.countDocuments({
      bookingType: "request",
    }).lean();

    const yearBackDate = dayjs().subtract(1, "year").toDate();

    const last12MonthProducts = await Product.find({
      createdAt: {
        $gte: yearBackDate,
      },
    })
      .select("createdAt")
      .lean();

    const totalUniqueProductCount =
      await Product.estimatedDocumentCount().lean();

    return {
      totalProductsCount,
      totalInstantProductsCount,
      totalOnRequestProductsCount,
      last12MonthProducts,
      totalUniqueProductCount,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllProducts = async (
  page: number,
  limit: number,
  bookingType: string
) => {
  try {
    const filters: Record<string, any> = {};

    if (bookingType === "all") {
      filters.bookingType = { $in: ["instant", "request"] };
    }

    if (bookingType === "instant") {
      filters.bookingType = "instant";
    }

    if (bookingType === "request") {
      filters.bookingType = "request";
    }

    const products = await ProductVariant.find(filters)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate("baseProduct")
      .lean();
    const productsCount = await ProductVariant.countDocuments(filters).lean();
    return { products, totalProducts: productsCount };
  } catch (error) {
    throw error;
  }
};

export const addNewProduct = async (product: ProductType, images: string[]) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newProduct = await Product.create([{ ...product, images }], {
      session: session,
    });

    const productTitle = slug(newProduct[0].title);

    const instantProducts = product.tourGuideLanguageInstant?.map((p) => {
      const productCode = PRODUCT_CODE_KEY_PREFIX + nanoid(6);
      return {
        ...product,
        baseProduct: newProduct[0]._id,
        bookingType: "instant",
        tourGuideLanguage: p,
        url: productTitle + "-" + productCode.toUpperCase(),
        productCode: productCode.toUpperCase(),
      };
    });

    const onRequestProducts = product.tourGuideLanguageOnRequest?.map((p) => {
      const productCode = PRODUCT_CODE_KEY_PREFIX + nanoid(6);
      return {
        ...product,
        baseProduct: newProduct[0]._id,
        bookingType: "request",
        tourGuideLanguage: p,
        url: productTitle + "-" + productCode.toUpperCase(),
        productCode: productCode.toUpperCase(),
      };
    });

    const productVariants = [instantProducts, onRequestProducts].flat();

    await ProductVariant.insertMany(productVariants, {
      session: session,
    });

    session.commitTransaction();
    session.endSession;

    return newProduct;
  } catch (error) {
    session.abortTransaction();
    await deleteMultipleImages(images);
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteMultipleImages = async (images: string[]) => {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: S3_BUCKET_NAME,
      Delete: {
        Objects: images.map((image) => ({ Key: image })),
      },
    });

    const result = await s3Client.send(command);
    return result;
  } catch (err) {
    console.error("Error deleting images:", err);
  }
};

export const uploadProductImages = async (
  files: Express.Multer.File[],
  title: string
) => {
  try {
    const uploadedImages: string[] = [];

    for (const file of files) {
      const key = `products/product-${randomUUID()}-${title}-${path.extname(
        file.originalname
      )}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      uploadedImages.push(key);
    }

    return uploadedImages;
  } catch (error) {
    throw error;
  }
};
