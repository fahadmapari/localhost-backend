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
        return sendResponse(res, "Rate limit exceeded", false, 429);
      }

      if (decision.reason.isBot()) {
        return sendResponse(res, "Bot access denied", false, 403);
      }

      return sendResponse(res, "Access denied", false, 403);
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    return sendResponse(res, "Internal Server Error", false, 500);
  }
};
