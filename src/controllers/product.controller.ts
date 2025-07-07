import { productZodSchema } from "../schema/product.schema.ts";
import { addNewProduct, getAllProducts } from "../services/product.service.ts";
import { ExpressController } from "../types/controller.types.ts";
import { sendResponse } from "../utils/controller.ts";

export const getProducts: ExpressController = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    sendResponse(res, "Products fetched successfully", true, 200, {
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const addProduct: ExpressController = async (req, res, next) => {
  try {
    const parsedBody = productZodSchema.parse(req.body);

    const newProduct = await addNewProduct(parsedBody);

    sendResponse(res, "Product added successfully", true, 200, {
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};
