import {
  createNewConversationService,
  getAllConversationsOfUserService,
} from "../services/conversation.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const getAllConversationsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw createError("Unauthorized", 401);
    }

    const conversations = await getAllConversationsOfUserService(req.user.id);

    return sendResponse(
      res,
      "All conversations fetched successfully!",
      true,
      200,
      conversations
    );
  } catch (error) {
    next(error);
  }
};

export const createNewConversationController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw createError("Unauthorized", 401);
    }

    const conversation = await createNewConversationService(
      [req.user.id, req.body.participantId],
      req.body.title,
      req.user.id
    );

    return sendResponse(
      res,
      "Conversation created successfully!",
      true,
      200,
      conversation
    );
  } catch (error) {
    next(error);
  }
};
