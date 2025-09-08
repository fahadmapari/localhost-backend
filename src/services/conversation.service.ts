import { Conversation, Message } from "../models/conversation.model";
import { createError } from "../utils/errorHandlers";

export const getConversationService = async (conversationId: string) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants")
      .lean();

    if (!conversation) {
      throw createError("conversation not found", 404);
    }

    return conversation;
  } catch (error) {
    throw error;
  }
};

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
    })
      .populate("participants lastMessage")
      .lean();
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
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw createError("conversation not found", 404);
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender,
      text: message,
    });

    await conversation.updateOne({ $set: { lastMessage: newMessage._id } });

    return newMessage;
  } catch (error) {
    throw error;
  }
};
