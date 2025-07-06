import {
  getAllRegisteredUsers,
  getUserById,
} from "../services/user.service.js";
import { ExpressController } from "../types/controller.types.js";
import { sendResponse } from "../utils/controller.js";

export const getAllUsers: ExpressController = async (req, res, next) => {
  try {
    const users = await getAllRegisteredUsers();
    sendResponse(res, "Request successful", true, 200, users);
  } catch (error) {
    next(error);
  }
};

export const getUser: ExpressController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user?.id) {
      return sendResponse(res, "Unauthorized", false, 401);
    }

    const user = await getUserById(id);

    sendResponse(res, "Request successful", true, 200, user);
  } catch (error) {
    next(error);
  }
};
