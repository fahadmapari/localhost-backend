import {
  createNewConversationService,
  getAllConversationsOfUserService,
  getAllMessagesForConversationService,
  getConversationService,
} from "../services/conversation.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const getConversationController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      throw createError("conversationId is required", 400);
    }

    const conversation = await getConversationService(conversationId);

    return sendResponse(
      res,
      "Conversation fetched successfully!",
      true,
      200,
      conversation
    );
  } catch (error) {
    next(error);
  }
};

export const getAllMessagesForConversationController: ExpressController =
  async (req, res, next) => {
    try {
      const conversationId = req.params.conversationId;

      if (!conversationId) {
        throw createError("conversationId is required", 400);
      }

      const messages = await getAllMessagesForConversationService(
        conversationId
      );

      return sendResponse(
        res,
        "All messages fetched successfully!",
        true,
        200,
        messages
      );
    } catch (error) {
      next(error);
    }
  };

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
