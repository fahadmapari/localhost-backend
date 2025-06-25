import mongoose from "mongoose";
import User, { UserDocument } from "../models/user.model";
import { throwError } from "../utils/errorHandlers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_EXP_IN, JWT_SECRET } from "../config/env";
import ms from "ms";

export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: UserDocument }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throwError("User already exists", 409);
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      {
        session,
      }
    );

    if (!JWT_SECRET) {
      throwError("Server Error", 500);
    }

    const token = jwt.sign(
      {
        userId: newUser[0]._id.toString(),
      },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    await session.commitTransaction();

    return {
      token,
      user: newUser[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
