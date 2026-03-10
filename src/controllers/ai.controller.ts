import { Request, Response } from "express";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { rewriteText } from "../services/ai.service";

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
