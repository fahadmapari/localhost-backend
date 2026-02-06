import { getAllRegisteredUsers, getUserById } from "../services/user.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const getAllUsers: ExpressController = async (req, res, next) => {
  try {
    const users = await getAllRegisteredUsers();
    sendResponse(res, {
      message: "Request successful",
      statusCode: 200,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser: ExpressController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user?.id) {
      return sendResponse(res, {
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    const user = await getUserById(id);

    sendResponse(res, {
      message: "Request successful",
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
