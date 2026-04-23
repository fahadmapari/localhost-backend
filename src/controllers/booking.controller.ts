import { ExpressController } from "../types/controller.types";
import {
  assignGuideSchema,
  bookingZodSchema,
  orderItemOperationsSchema,
  updateGuideAssignmentSchema,
} from "../schema/booking.schema";
import {
  assignGuideService,
  createNewBookingService,
  deleteClientItineraryService,
  deleteGuideItineraryService,
  getBookingByIdService,
  getBookingsService,
  removeGuideAssignmentService,
  updateGuideAssignmentService,
  updateOrderItemOperationsService,
  uploadClientItineraryService,
  uploadGuideItineraryService,
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

export const updateOrderItemOperationsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const { id, idx } = req.params;

    if (!id) {
      throw createError("Booking id is required", 400);
    }

    const itemIdx = Number(idx);
    if (!Number.isInteger(itemIdx) || itemIdx < 0) {
      throw createError("Order item index must be a non-negative integer", 400);
    }

    const parsedBody = orderItemOperationsSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const booking = await updateOrderItemOperationsService(
      id,
      itemIdx,
      parsedBody.data
    );

    sendResponse(res, {
      message: "Operations updated successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const parseItemIdx = (raw: unknown) => {
  const itemIdx = Number(raw);
  if (!Number.isInteger(itemIdx) || itemIdx < 0) {
    throw createError("Order item index must be a non-negative integer", 400);
  }
  return itemIdx;
};

export const assignGuideController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Booking id is required", 400);
    const itemIdx = parseItemIdx(req.params.idx);

    const parsedBody = assignGuideSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const booking = await assignGuideService(
      req.params.id,
      itemIdx,
      parsedBody.data,
      req.user.id
    );

    sendResponse(res, {
      message: "Guide assigned successfully",
      statusCode: 201,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGuideAssignmentController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Booking id is required", 400);
    if (!req.params.assignmentId) {
      throw createError("Assignment id is required", 400);
    }
    const itemIdx = parseItemIdx(req.params.idx);

    const parsedBody = updateGuideAssignmentSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const booking = await updateGuideAssignmentService(
      req.params.id,
      itemIdx,
      req.params.assignmentId,
      parsedBody.data
    );

    sendResponse(res, {
      message: "Assignment updated successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const removeGuideAssignmentController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Booking id is required", 400);
    if (!req.params.assignmentId) {
      throw createError("Assignment id is required", 400);
    }
    const itemIdx = parseItemIdx(req.params.idx);

    const booking = await removeGuideAssignmentService(
      req.params.id,
      itemIdx,
      req.params.assignmentId
    );

    sendResponse(res, {
      message: "Assignment removed successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadClientItineraryController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Booking id is required", 400);
    if (!req.file) throw createError("No file uploaded", 400);

    const booking = await uploadClientItineraryService(
      req.params.id,
      req.file,
      req.user.id
    );

    sendResponse(res, {
      message: "Client itinerary uploaded successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClientItineraryController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Booking id is required", 400);

    const booking = await deleteClientItineraryService(req.params.id);

    sendResponse(res, {
      message: "Client itinerary removed successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadGuideItineraryController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Booking id is required", 400);
    if (!req.file) throw createError("No file uploaded", 400);

    const itemIdx = Number(req.params.idx);
    if (!Number.isInteger(itemIdx) || itemIdx < 0) {
      throw createError("Order item index must be a non-negative integer", 400);
    }

    const booking = await uploadGuideItineraryService(
      req.params.id,
      itemIdx,
      req.file,
      req.user.id
    );

    sendResponse(res, {
      message: "Guide itinerary uploaded successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGuideItineraryController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Booking id is required", 400);

    const itemIdx = Number(req.params.idx);
    if (!Number.isInteger(itemIdx) || itemIdx < 0) {
      throw createError("Order item index must be a non-negative integer", 400);
    }

    const booking = await deleteGuideItineraryService(req.params.id, itemIdx);

    sendResponse(res, {
      message: "Guide itinerary removed successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) {
      throw createError("Booking id is required", 400);
    }

    const booking = await getBookingByIdService(req.params.id);

    sendResponse(res, {
      message: "Booking fetched successfully",
      statusCode: 200,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
