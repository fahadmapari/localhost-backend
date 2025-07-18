import { productZodSchema } from "../schema/product.schema";
import { addNewProduct, getAllProducts } from "../services/product.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

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

function parseNestedObject<T = any>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const keys = key.split(".");
      let current: Record<string, any> = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, any>;
      }

      current[keys[keys.length - 1]] = obj[key];
    }
  }

  return result as T;
}

export const addProduct: ExpressController = async (req, res, next) => {
  try {
    console.log(parseNestedObject(req.body));

    const parsedBody = productZodSchema.safeParse({
      ...req.body,
      images: req.files,
    });

    if (!parsedBody.success) {
      console.log(parsedBody.error);
      return sendResponse(res, "Invalid Fields", false, 400, {
        error: parsedBody.error,
      });
    }

    console.log(parsedBody.data);
    console.log(req.files);

    // const newProduct = await addNewProduct(parsedBody);

    sendResponse(res, "Product added successfully", true, 200, {
      product: parsedBody.data,
    });
  } catch (error) {
    next(error);
  }
};
