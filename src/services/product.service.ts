import Product from "../models/product.model";
import { ProductType } from "../schema/product.schema";

export const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return products;
  } catch (error) {
    throw error;
  }
};

export const addNewProduct = async (product: ProductType) => {
  try {
    const newProduct = await Product.create(product);
    return newProduct;
  } catch (error) {
    throw error;
  }
};
