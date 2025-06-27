import { siginInUser, signupUser } from "../services/auth.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const signup: ExpressController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { accessToken, refreshToken, user } = await signupUser(
      name,
      email,
      password
    );

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
  } catch (error) {
    next(error);
  }
};
