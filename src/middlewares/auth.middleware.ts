import { sendResponse } from "../utils/controller";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { ExpressController } from "../types/controller.types";
import { createError } from "../utils/errorHandlers";

export const authorizationMiddleware: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendResponse(res, "Unauthorized", false, 401);
    }

    const decoded: any = jwt.verify(token, JWT_SECRET as string);

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    return sendResponse(
      res,
      error?.message || "Unauthorized",
      false,
      error?.statusCode || 401
    );
  }
};

export const isAdminMiddleware: ExpressController = async (req, res, next) => {
  try {
    console.log(req.user);
    if (req.user?.role === "admin" || req.user?.role === "super admin") {
      return next();
    }

    throw createError("Forbidden", 403);
  } catch (error: any) {
    return sendResponse(res, "Forbidden", false, error?.statusCode || 403);
  }
};
