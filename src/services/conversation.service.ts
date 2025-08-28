import { getAllConversationsController } from "./../controllers/conversation.controller";
import { Conversation } from "../models/conversation.model";

export const getAllConversationsOfUserService = async (userId: string) => {
  try {
    const conversations = await Conversation.find({
      createdBy: userId,
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
