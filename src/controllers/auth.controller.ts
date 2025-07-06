import { NODE_ENV } from "../config/env.js";
import {
  refreshAccessToken,
  revokeRefreshToken,
  siginInUser,
  signupUser,
  verifyAccessToken,
} from "../services/auth.service.js";
import { ExpressController } from "../types/controller.types.js";
import { sendResponse } from "../utils/controller.js";

export const signup: ExpressController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { accessToken, refreshToken, user } = await signupUser(
      name,
      email,
      password
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 60 * 1000,
      });

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

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 60 * 1000,
      });

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
    const refreshToken: string = req.cookies.refreshToken || req.body.token;

    if (!refreshToken) {
      return sendResponse(res, "Refresh token is required", false, 401);
    }

    const accessToken = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 60 * 1000,
    });

    sendResponse(res, "Token refreshed successfully", true, 200, {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyToken: ExpressController = async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization?.split(" ")[1]
      : null;

    if (!token) {
      return sendResponse(res, "Invalid request", false, 401);
    }

    await verifyAccessToken(token);

    sendResponse(res, "Request successful", true, 200);
  } catch (error) {
    next(error);
  }
};

export const logout: ExpressController = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.body.token;

    if (!token) {
      return sendResponse(res, "", true, 204);
    }

    await revokeRefreshToken(token);

    res.clearCookie("token");

    sendResponse(res, "Logged out successfully", true, 200);
  } catch (error) {
    res.clearCookie("token");
    sendResponse(res, "Logged out successfully", true, 200);
  }
};
