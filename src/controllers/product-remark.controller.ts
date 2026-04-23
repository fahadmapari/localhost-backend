import { ExpressController } from "../types/controller.types";
import { productRemarkSchema } from "../schema/product.schema";
import {
  createProductRemarkService,
  deleteProductRemarkService,
  listProductRemarksService,
} from "../services/product-remark.service";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const listProductRemarksController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Product id is required", 400);
    const remarks = await listProductRemarksService(req.params.id);
    sendResponse(res, {
      message: "Remarks fetched successfully",
      statusCode: 200,
      data: remarks,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductRemarkController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Product id is required", 400);

    const parsedBody = productRemarkSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const remark = await createProductRemarkService(
      req.params.id,
      parsedBody.data.text,
      req.user.id
    );

    sendResponse(res, {
      message: "Remark added successfully",
      statusCode: 201,
      data: remark,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductRemarkController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.remarkId) {
      throw createError("Remark id is required", 400);
    }

    const result = await deleteProductRemarkService(
      req.params.remarkId,
      req.user.id,
      req.user.role
    );

    sendResponse(res, {
      message: "Remark deleted successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
