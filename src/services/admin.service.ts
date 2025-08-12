import User from "../models/user.model";
import { z } from "zod";
import { userSchema } from "../schema/user.schema";
import { hashPassword } from "../utils/common";

export const changeAdminPasswordService = async (userId: string) => {
  try {
    const foundUser = await User.findById(userId);
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
