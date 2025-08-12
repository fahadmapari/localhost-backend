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
      return sendResponse(res, parsedBody.error.message, false, 400);
    }

    await changeAdminPasswordService(req.user.id, parsedBody.data.newPassword);

    return sendResponse(res, "Admin password changed successfully", true, 200);
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
      return sendResponse(res, parsedBody.error.message, false, 400);
    }

    const newAdmin = await createNewAdminService(parsedBody.data);

    return sendResponse(res, "New Admin registered", true, 200, newAdmin);
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins: ExpressController = async (req, res, next) => {
  try {
    const admins = await getAllAdminsService();

    return sendResponse(res, "Request successful", true, 200, admins);
  } catch (error) {
    next(error);
  }
};
