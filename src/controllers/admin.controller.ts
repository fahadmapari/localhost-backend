import { getAllAdminsService } from "../services/admin.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const getAllAdmins: ExpressController = async (req, res, next) => {
  try {
    const admins = await getAllAdminsService();

    return sendResponse(res, "Request successful", true, 200, admins);
  } catch (error) {
    next(error);
  }
};
