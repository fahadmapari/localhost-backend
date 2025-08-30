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
  THIRTY_DAYS,
} from "../config/env";
import ms from "ms";
import crypto from "crypto";
import redisClient from "../config/redis";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyRefreshToken,
  verifyToken,
} from "../utils/common";

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  role: string
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
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword, role }],
      {
        session,
      }
    );

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw createError("Server Error", 500);
    }

    const accessToken = generateAccessToken(
      newUser[0]._id.toString(),
      newUser[0].role
    );

    const jti = crypto.randomUUID();

    const refreshToken = generateRefreshToken(
      newUser[0]._id.toString(),
      newUser[0].role,
      jti
    );

    await redisClient.set(
      `refresh:${jti}`,
      {
        userId: newUser[0]._id.toString(),
        name: newUser[0].name,
        role: newUser[0].role,
        email: newUser[0].email,
      },
      {
        ex: Number(THIRTY_DAYS), // 30 days
        nx: true, // Only set if not exists
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
  user: { name: string; email: string; role: string; userId: string };
}> => {
  try {
    const foundUser = await User.findOne({
      email,
    }).populate("password");

    if (!foundUser) {
      throw createError("User not found", 404);
    }

    const isPasswordCorrect = await comparePassword(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      throw createError("Incorrect password", 401);
    }

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw createError("Server Error", 500);
    }

    const accessToken = generateAccessToken(
      foundUser._id.toString(),
      foundUser.role
    );

    const jti = crypto.randomUUID();

    const refreshToken = generateRefreshToken(
      foundUser._id.toString(),
      foundUser.role,
      jti
    );

    await redisClient.set(
      `refresh:${jti}`,
      {
        userId: foundUser._id.toString(),
        name: foundUser.name,
        role: foundUser.role,
        email: foundUser.email,
      },
      {
        ex: Number(THIRTY_DAYS), // 30 days
        nx: true, // Only set if not exists
      }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        userId: foundUser._id.toString(),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET!);

    const exists = (await redisClient.get(`refresh:${decoded?.jti}`)) as {
      userId: string;
      name: string;
      role: string;
      email: string;
    };

    if (!exists || exists.userId !== decoded.userId) {
      throw createError("Invalid token", 401);
    }

    const accessToken = generateAccessToken(decoded.userId, decoded.role);

    return { accessToken, user: exists };
  } catch (error: any) {
    if (
      error?.message === "jwt expired" ||
      error?.message === "invalid signature"
    ) {
      error.statusCode = 401;
    }
    console.log(error);
    throw error;
  }
};

export const verifyAccessToken = async (accessToken: string) => {
  try {
    const decoded: any = verifyToken(accessToken);

    return {
      userId: decoded.userId as string,
      role: decoded.role as string,
    };
  } catch (error: any) {
    if (
      error.message === "jwt expired" ||
      error.message === "invalid signature"
    ) {
      error.statusCode = 401;
    }
    console.log(error);
    throw error;
  }
};

export const revokeRefreshToken = async (refreshToken: string) => {
  try {
    const decoded: any = verifyRefreshToken(refreshToken);
    await redisClient.del(`refresh:${decoded?.jti}`);
  } catch (error) {
    throw error;
  }
};
