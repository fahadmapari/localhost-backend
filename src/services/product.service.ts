import Product, { ProductVariant } from "../models/product.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME } from "../config/env";
import { randomUUID } from "crypto";
import path from "path";
import s3Client from "../config/s3";
import { ProductType } from "../schema/product.schema";
import dayjs from "dayjs";

export const findProductById = async (id: string) => {
  const prduct = await ProductVariant.findById(id)
    .populate("baseProduct")
    .lean();
  return prduct;
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
  try {
    const newProduct = await Product.create({ ...product, images });
    const instantProducts = product.tourGuideLanguageInstant?.map((p) => ({
      ...product,
      baseProduct: newProduct._id,
      bookingType: "instant",
      tourGuideLanguage: p,
    }));
    const onRequestProducts = product.tourGuideLanguageOnRequest?.map((p) => ({
      ...product,
      baseProduct: newProduct._id,
      bookingType: "request",
      tourGuideLanguage: p,
    }));

    const productVariants = [instantProducts, onRequestProducts].flat();

    await ProductVariant.insertMany(productVariants);

    return newProduct;
  } catch (error) {
    throw error;
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
