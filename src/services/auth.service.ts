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
import crypto from "crypto";
import redisClient from "../config/redis";

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
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword, role }],
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
        role: newUser[0].role,
      },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    const jti = crypto.randomUUID();

    const refreshToken = jwt.sign(
      {
        userId: newUser[0]._id.toString(),
        role: newUser[0].role,
        jti,
      },
      JWT_REFRESH_SECRET!,
      {
        expiresIn: JWT_REFRESH_EXP_IN as ms.StringValue,
      }
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
        ex: 30 * 24 * 60 * 60, // 30 days
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
        userId: foundUser._id.toString(),
        role: foundUser.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    const jti = crypto.randomUUID();

    const refreshToken = jwt.sign(
      {
        userId: foundUser._id.toString(),
        role: foundUser.role,
        jti,
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: JWT_REFRESH_EXP_IN as ms.StringValue,
      }
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
        ex: 30 * 24 * 60 * 60, // 30 days
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

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
      },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXP_IN as ms.StringValue,
      }
    );

    return { accessToken, user: exists };
  } catch (error: any) {
    if (
      error?.message === "jwt expired" ||
      error?.message === "invalid signature"
    ) {
      error.statusCode = 401;
    }
    throw error;
  }
};

export const verifyAccessToken = async (accessToken: string) => {
  try {
    const decoded: any = jwt.verify(accessToken, JWT_SECRET!);

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
    throw error;
  }
};

export const revokeRefreshToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET!);
    await redisClient.del(`refresh:${decoded?.jti}`);
  } catch (error) {
    throw error;
  }
};
