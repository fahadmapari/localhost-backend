import { changePasswordSchema, userSchema } from "../schema/user.schema";
import {
  changeAdminPasswordService,
  createNewAdminService,
  getAllAdminsService,
} from "../services/admin.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const changeAdminPasswordController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw createError("User not found", 403);
    }

    const parsedBody = changePasswordSchema.safeParse(req.body);

    if (parsedBody.error) {
      return sendResponse(res, {
        message: parsedBody.error.message,
        statusCode: 400,
      });
    }

    await changeAdminPasswordService(req.user.id, parsedBody.data.newPassword);

    return sendResponse(res, {
      message: "Admin password changed successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const createNewAdminController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const parsedBody = userSchema.safeParse(req.body);

    if (parsedBody.error) {
      return sendResponse(res, {
        message: parsedBody.error.message,
        statusCode: 400,
      });
    }

    const newAdmin = await createNewAdminService(parsedBody.data);

    return sendResponse(res, {
      message: "New Admin registered",
      statusCode: 200,
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins: ExpressController = async (req, res, next) => {
  try {
    const admins = await getAllAdminsService();

    return sendResponse(res, {
      message: "Request successful",
      statusCode: 200,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};
