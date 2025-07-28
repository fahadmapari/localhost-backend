import { ExpressController } from "./../types/controller.types";
import { productZodSchema } from "../schema/product.schema";
import {
  addNewProduct,
  fetchProductMetrics,
  findProductById,
  getAllProducts,
  uploadProductImages,
} from "../services/product.service";
import { sendResponse } from "../utils/controller";
import { parseNestedObject } from "../utils/common";
import { createError } from "../utils/errorHandlers";

export const editProductById: ExpressController = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw createError("Product id is required", 400);
    }

    const product = await findProductById(req.params.id);

    sendResponse(res, "Product fetched successfully", true, 200, product);
  } catch (error) {
    next(error);
  }
};

export const getProductById: ExpressController = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw createError("Product id is required", 400);
    }
    const product = await findProductById(req.params.id);

    sendResponse(res, "Product fetched successfully", true, 200, product);
  } catch (error) {
    next(error);
  }
};

export const getProducts: ExpressController = async (req, res, next) => {
  try {
    const { page = 0, limit = 10, bookingType = "all" } = req.query;

    const products = await getAllProducts(
      Number(page),
      Number(limit) < 100 ? Number(limit) : 100,
      bookingType.toString()
    );

    sendResponse(res, "Products fetched successfully", true, 200, {
      productsData: products,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getProductMetrics: ExpressController = async (req, res, next) => {
  try {
    const metrics = await fetchProductMetrics();
    sendResponse(res, "Metrics fetched successfully", true, 200, metrics);
  } catch (error) {
    console.log(error);
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
