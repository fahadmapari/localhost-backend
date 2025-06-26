import { siginInUser, signupUser } from "../services/auth.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";
import { generateAccessToken, verifyRefreshToken } from "../utils/jwt";
import redisClient from "../config/redis";
import { createError } from "../utils/errorHandlers";

export const signup: ExpressController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { accessToken, refreshToken, user } = await signupUser(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { accessToken, refreshToken, user },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn: ExpressController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, "Invalid request", false, 400);
    }

    const { accessToken, refreshToken, user } = await siginInUser(
      email,
      password
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { accessToken, refreshToken, user },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken: ExpressController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError("Invalid token", 400);
    }

    const decoded = verifyRefreshToken(refreshToken) as { userId: string };

    const storedToken = await redisClient.get(decoded.userId);

    if (storedToken !== refreshToken) {
      throw createError("Invalid token", 401);
    }

    const accessToken = generateAccessToken({ userId: decoded.userId });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
