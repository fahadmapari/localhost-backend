import { ExpressController } from "../types/controller.types";

export const createClientController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    next(error);
  }
};
