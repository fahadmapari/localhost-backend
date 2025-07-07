import User, { UserDocument } from "../models/user.model.ts";
import { createError } from "../utils/errorHandlers.ts";

export const getAllRegisteredUsers = async (): Promise<UserDocument[]> => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: string): Promise<UserDocument> => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw createError("User not found", 404);
    }

    return user;
  } catch (error) {
    throw error;
  }
};
