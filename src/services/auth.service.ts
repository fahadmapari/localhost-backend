import mongoose from "mongoose";
import User, { UserDocument } from "../models/user.model";
import { createError } from "../utils/errorHandlers";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import redisClient from "../config/redis";

export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: UserDocument }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw createError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      {
        session,
      }
    );

    const payload = { userId: newUser[0]._id.toString() };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await redisClient.set(newUser[0]._id.toString(), refreshToken);

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

    const payload = { userId: foundUser._id.toString() };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await redisClient.set(foundUser._id.toString(), refreshToken);

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
