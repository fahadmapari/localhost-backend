import { signupUser } from "../services/auth.service";
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
