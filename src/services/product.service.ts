import multer from "multer";
import Product, { ProductDocument } from "../models/product.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME } from "../config/env";
import { randomUUID } from "crypto";
import path from "path";
import s3Client from "../config/s3";
import { ProductType } from "../schema/product.schema";

export const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    const productsCount = await Product.estimatedDocumentCount();
    return { products, totalProducts: productsCount };
  } catch (error) {
    throw error;
  }
};

export const addNewProduct = async (product: ProductType, images: string[]) => {
  try {
    const newProduct = await Product.create({ ...product, images });
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
