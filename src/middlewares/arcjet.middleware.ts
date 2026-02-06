import { RequestHandler } from "express";
import { aj } from "../config/arcjet";
import { sendResponse } from "../utils/controller";

export const arcjetMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return sendResponse(res, {
          message: "Rate limit exceeded",
          statusCode: 429,
        });
      }

      if (decision.reason.isBot()) {
        return sendResponse(res, {
          message: "Bot access denied",
          statusCode: 403,
        });
      }

      return sendResponse(res, {
        message: "Access denied",
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    return sendResponse(res, {
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
};
