import { Conversation, Message } from "../models/conversation.model";
import { createError } from "../utils/errorHandlers";

export const getAllMessagesForConversationService = async (
  conversationId: string
) => {
  try {
    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();
    return messages;
  } catch (error) {
    throw error;
  }
};

export const getAllConversationsOfUserService = async (userId: string) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ participants: userId }, { createdBy: userId }],
    }).populate("participants");
    return conversations;
  } catch (error) {
    throw error;
  }
};

export const createNewConversationService = async (
  participants: string[],
  title: string,
  createdBy: string
) => {
  try {
    const conversation = await Conversation.create({
      participants,
      title,
      createdBy,
    });

    return conversation;
  } catch (error) {
    throw error;
  }
};

export const createNewMessageService = async (
  conversationId: string,
  message: string,
  sender: string
) => {
  try {
    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      throw createError("conversation not found", 404);
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender,
      text: message,
    });

    return newMessage;
  } catch (error) {
    throw error;
  }
};
