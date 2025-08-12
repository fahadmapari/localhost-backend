import { create } from "lodash";
import User from "../models/user.model";

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
