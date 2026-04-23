import { ExpressController } from "../types/controller.types";
import { bookingZodSchema } from "../schema/booking.schema";
import {
  createNewBookingService,
  getBookingsService,
} from "../services/booking.service";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const createBookingController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw createError("Unauthorized", 401);
    }

    const parsedBody = bookingZodSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: {
          error: parsedBody.error,
        },
      });
    }

    const booking = await createNewBookingService(
      parsedBody.data,
      req.user.id
    );

    sendResponse(res, {
      message: "Booking created successfully",
      statusCode: 201,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const { page = 0, limit = 10 } = req.query;

    const data = await getBookingsService(
      Number(page),
      Number(limit) < 100 ? Number(limit) : 100
    );

    sendResponse(res, {
      message: "Bookings fetched successfully",
      statusCode: 200,
      data,
    });
  } catch (error) {
    next(error);
  }
};
