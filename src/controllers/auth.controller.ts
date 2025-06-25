import { siginInUser, signupUser } from "../services/auth.service";
import { ExpressController } from "../types/controller.types";

export const signup: ExpressController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { token, user } = await signupUser(name, email, password);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn: ExpressController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await siginInUser(email, password);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};
