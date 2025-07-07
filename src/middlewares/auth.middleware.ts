import { sendResponse } from "../utils/controller.ts";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.ts";
import { ExpressController } from "../types/controller.types.ts";

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
      email: decoded.email,
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
