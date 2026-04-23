import Booking from "../models/booking.models";
import { BookingInput } from "../schema/booking.schema";

export const createNewBookingService = async (
  data: BookingInput,
  bookedBy: string
) => {
  try {
    const totalPrice = data.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const booking = await Booking.create({
      ...data,
      totalPrice,
      bookedFrom: "admin",
      bookedBy,
    });

    return booking;
  } catch (error) {
    throw error;
  }
};

export const getBookingsService = async (page: number, limit: number) => {
  try {
    const [bookings, total] = await Promise.all([
      Booking.find()
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .populate("clientId")
        .lean(),
      Booking.estimatedDocumentCount(),
    ]);

    return { bookings, total };
  } catch (error) {
    throw error;
  }
};
