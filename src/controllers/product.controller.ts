import { productZodSchema } from "../schema/product.schema";
import { addNewProduct, getAllProducts } from "../services/product.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { parseNestedObject } from "../utils/common";

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
    const parsedObject = parseNestedObject(req.body);

    const parsedBody = productZodSchema.safeParse({
      ...parsedObject,
      images: req.files,
    });

    if (!parsedBody.success) {
      console.log(parsedBody.error);
      return sendResponse(res, "Invalid Fields", false, 400, {
        error: parsedBody.error,
      });
    }

    const newProduct = await addNewProduct(parsedBody.data);

    sendResponse(res, "Product added successfully", true, 200, {
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};
