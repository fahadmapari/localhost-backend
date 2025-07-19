import { productZodSchema } from "../schema/product.schema";
import {
  addNewProduct,
  getAllProducts,
  uploadProductImages,
} from "../services/product.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { parseNestedObject } from "../utils/common";
import { createError } from "../utils/errorHandlers";

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
    if (!req.files || req.files.length === 0) {
      throw createError("No files uploaded", 400);
    }
    const parsedObject = parseNestedObject(req.body);

    const parsedBody = productZodSchema.safeParse(parsedObject);

    if (!parsedBody.success) {
      console.log(parsedBody.error);
      return sendResponse(res, "Invalid Fields", false, 400, {
        error: parsedBody.error,
      });
    }

    const images = await uploadProductImages(
      req.files as Express.Multer.File[],
      parsedBody.data.title
    );

    const newProduct = await addNewProduct(parsedBody.data, images);

    sendResponse(res, "Product added successfully", true, 200, {
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};
