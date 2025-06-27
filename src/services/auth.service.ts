import mongoose from "mongoose";
import User, { UserDocument } from "../models/user.model";
import { createError } from "../utils/errorHandlers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  JWT_EXP_IN,
  JWT_REFRESH_EXP_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from "../config/env";
import ms from "ms";

export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserDocument;
}> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw createError("User already exists", 409);
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      {
        session,
      }
    );

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw createError("Server Error", 500);
    }

    const accessToken = jwt.sign(
      {
        userId: newUser[0]._id.toString(),
        email: newUser[0].email,
      },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser[0]._id.toString(),
      },
      JWT_REFRESH_SECRET!,
      {
        expiresIn: JWT_REFRESH_EXP_IN as ms.StringValue,
      }
    );

    await session.commitTransaction();

    return {
      accessToken,
      refreshToken,
      user: newUser[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const siginInUser = async (
  email: string,
  password: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { name: string; email: string };
}> => {
  try {
    const foundUser = await User.findOne({
      email,
    }).populate("password");

    if (!foundUser) {
      throw createError("User not found", 404);
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      throw createError("Incorrect password", 401);
    }

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw createError("Server Error", 500);
    }

    const accessToken = jwt.sign(
      {
        userId: foundUser._id,
        email: foundUser.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: foundUser._id,
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: JWT_REFRESH_EXP_IN as ms.StringValue,
      }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        email: foundUser.email,
        name: foundUser.name,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const generateRefreshToken = async (refreshToken: string) => {};
