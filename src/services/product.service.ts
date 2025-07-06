import Product from "../models/product.model";

export const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return products;
  } catch (error) {
    throw error;
  }
};
