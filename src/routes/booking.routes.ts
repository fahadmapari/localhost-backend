import { Router } from "express";
import {
  createBookingController,
  getBookingsController,
} from "../controllers/booking.controller";

const bookingRouter = Router();

bookingRouter.get("/", getBookingsController);

bookingRouter.post("/", createBookingController);

export default bookingRouter;
