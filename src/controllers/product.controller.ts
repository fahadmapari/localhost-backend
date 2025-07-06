import { getAllProducts } from "../services/product.service";
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
