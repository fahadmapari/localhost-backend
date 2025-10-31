import { Router } from "express";
import {
  createBookingController,
  getBookingsController,
} from "../controllers/booking.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const bookingRouter = Router();

bookingRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getBookingsController
);

bookingRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createBookingController
);

export default bookingRouter;
