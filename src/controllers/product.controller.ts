import { ExpressController } from "./../types/controller.types";
import {
  editProductZodSchema,
  productZodSchema,
} from "../schema/product.schema";
import {
  addNewProduct,
  fetchProductMetrics,
  findProductById,
  getAllProducts,
  searchProuductsByTextService,
  updateProductById,
  uploadProductImages,
} from "../services/product.service";
import { sendResponse } from "../utils/controller";
import { generateETag, parseNestedObject } from "../utils/common";
import { createError } from "../utils/errorHandlers";
import { send } from "process";

export const editProductById: ExpressController = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw createError("Product id is required", 400);
    }

    const parsedObject = parseNestedObject(req.body);

    const parsedBody = editProductZodSchema.safeParse(parsedObject);

    if (parsedBody.error) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: {
          error: parsedBody.error,
        },
      });
    }

    const product = await updateProductById(
      req.params.id,
      parsedBody.data,
      req.files as Express.Multer.File[]
    );

    sendResponse(res, {
      message: "Product fetched successfully",
      statusCode: 200,
      data: product,
    });
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

    sendResponse(res, {
      message: "Product fetched successfully",
      statusCode: 200,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts: ExpressController = async (req, res, next) => {
  try {
    const {
      page = 0,
      limit = 10,
      bookingType = "all",
      searchTerm = "",
    } = req.query;

    const products = await getAllProducts(
      Number(page),
      Number(limit) < 100 ? Number(limit) : 100,
      bookingType.toString(),
      searchTerm.toString()
    );

    sendResponse(res, {
      message: "Products fetched successfully",
      statusCode: 200,
      data: {
        productsData: products,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getProductMetrics: ExpressController = async (req, res, next) => {
  try {
    const metrics = await fetchProductMetrics();
    const etag = generateETag(metrics);

    if (req.headers["if-none-match"] === etag) {
      return sendResponse(res, {
        message: "Metrics not modified",
        statusCode: 304,
      });
    }

    res.set({
      "Cache-Control": "private, max-age=3600",
      ETag: generateETag(metrics),
    });
    sendResponse(res, {
      message: "Metrics fetched successfully",
      statusCode: 200,
      data: metrics,
    });
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
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: {
          error: parsedBody.error,
        },
      });
    }

    const images = await uploadProductImages(
      req.files as Express.Multer.File[],
      parsedBody.data.title
    );

    const newProduct = await addNewProduct(parsedBody.data, images);

    sendResponse(res, {
      message: "Product added successfully",
      statusCode: 200,
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchProductController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.body.searchTerm) {
      throw createError("Search term is required", 400);
    }

    const products = await searchProuductsByTextService(req.body.searchTerm);

    return sendResponse(res, {
      message: "Products fetched successfully",
      statusCode: 200,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
