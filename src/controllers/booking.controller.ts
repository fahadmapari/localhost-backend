import { ExpressController } from "../types/controller.types";

export const createBookingController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    console.log(req.body);
  } catch (error) {
    next(error);
  }
};

export const getBookingsController: ExpressController = async (
  req,
  res,
  next
) => {};
