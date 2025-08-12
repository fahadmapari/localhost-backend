import User from "../models/user.model";
import { z } from "zod";
import { userSchema } from "../schema/user.schema";
import { hashPassword } from "../utils/common";
import { createError } from "../utils/errorHandlers";

export const changeAdminPasswordService = async (
  userId: string,
  newPassword: string
) => {
  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw createError("User not found", 404);
    }
    const hashedPassword = await hashPassword(newPassword);

    await foundUser.updateOne({
      password: hashedPassword,
    });
  } catch (error) {
    throw error;
  }
};

export const createNewAdminService = async (
  values: z.infer<typeof userSchema>
) => {
  try {
    const hashedPassword = await hashPassword(values.password);

    const newAdmin = await User.create({
      name: values.name,
      email: values.email,
      password: hashedPassword,
      role: values.role,
    });

    return newAdmin;
  } catch (error) {
    throw error;
  }
};

export const getAllAdminsService = async () => {
  try {
    const admins = await User.find({
      role: {
        $in: ["super admin", "admin"],
      },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return admins;
  } catch (error) {
    throw error;
  }
};
