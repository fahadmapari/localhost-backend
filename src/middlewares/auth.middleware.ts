import { sendResponse } from "../utils/controller";
import User from "../models/user.model";
import { ExpressController } from "../types/controller.types";
import { verifyAccessToken } from "../utils/jwt";

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

    const decoded: any = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendResponse(res, "Unauthorized", false, 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    return sendResponse(res, "Unauthorized", false, 401);
  }
};
