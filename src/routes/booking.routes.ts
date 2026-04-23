import { Router } from "express";
import {
  assignGuideController,
  createBookingController,
  deleteClientItineraryController,
  deleteGuideItineraryController,
  getBookingByIdController,
  getBookingsController,
  removeGuideAssignmentController,
  updateGuideAssignmentController,
  updateOrderItemOperationsController,
  uploadClientItineraryController,
  uploadGuideItineraryController,
} from "../controllers/booking.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";
import { uploadDocument } from "../config/multer";

const bookingRouter = Router();

bookingRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getBookingsController
);

bookingRouter.get(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  getBookingByIdController
);

bookingRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createBookingController
);

bookingRouter.patch(
  "/:id/order-items/:idx/operations",
  authorizationMiddleware,
  isAdminMiddleware,
  updateOrderItemOperationsController
);

bookingRouter.post(
  "/:id/itinerary/client",
  authorizationMiddleware,
  isAdminMiddleware,
  uploadDocument.single("file"),
  uploadClientItineraryController
);

bookingRouter.delete(
  "/:id/itinerary/client",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteClientItineraryController
);

bookingRouter.post(
  "/:id/order-items/:idx/itinerary/guide",
  authorizationMiddleware,
  isAdminMiddleware,
  uploadDocument.single("file"),
  uploadGuideItineraryController
);

bookingRouter.delete(
  "/:id/order-items/:idx/itinerary/guide",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteGuideItineraryController
);

bookingRouter.post(
  "/:id/order-items/:idx/guides",
  authorizationMiddleware,
  isAdminMiddleware,
  assignGuideController
);

bookingRouter.patch(
  "/:id/order-items/:idx/guides/:assignmentId",
  authorizationMiddleware,
  isAdminMiddleware,
  updateGuideAssignmentController
);

bookingRouter.delete(
  "/:id/order-items/:idx/guides/:assignmentId",
  authorizationMiddleware,
  isAdminMiddleware,
  removeGuideAssignmentController
);

export default bookingRouter;
