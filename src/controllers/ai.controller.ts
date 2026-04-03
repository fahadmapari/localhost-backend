import { Request, Response } from "express";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { productQueryService, rewriteText } from "../services/ai.service";

export const rewriteController: ExpressController = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      sendResponse(res, {
        message: "Text is required",
        statusCode: 400,
        success: false,
      });
    }

    const rewrittenText = await rewriteText(text);

    sendResponse(res, {
      message: "Text rewritten successfully",
      statusCode: 200,
      success: true,
      data: {
        rewrittenText,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const askProductController: ExpressController = async (
  req,
  res,
  next,
) => {
  try {
    const { query } = req.body;

    if (!query) {
      sendResponse(res, {
        message: "Query is required",
        statusCode: 400,
        success: false,
      });
    }

    const answer = await productQueryService(query);

    sendResponse(res, {
      message: "Product query completed successfully",
      statusCode: 200,
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    next(error);
  }
};
