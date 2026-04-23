import { nanoid } from "nanoid";
import path from "path";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3";
import { S3_BUCKET_NAME } from "../config/env";
import Booking from "../models/booking.models";
import {
  AssignGuideInput,
  BookingInput,
  OrderItemOperationsInput,
  UpdateGuideAssignmentInput,
} from "../schema/booking.schema";
import { createError } from "../utils/errorHandlers";

type ItineraryKind = "client" | "guide";

const buildItineraryRecord = (
  file: Express.Multer.File,
  key: string,
  uploadedBy: string
) => ({
  key,
  filename: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  uploadedAt: new Date(),
  uploadedBy: new mongoose.Types.ObjectId(uploadedBy),
});

const uploadItineraryToS3 = async (
  file: Express.Multer.File,
  bookingId: string,
  kind: ItineraryKind,
  itemIdx?: number
): Promise<{ key: string }> => {
  const ext = path.extname(file.originalname);
  const suffix = kind === "guide" ? `-item-${itemIdx}` : "";
  const key = `bookings/${bookingId}/itinerary-${kind}${suffix}-${randomUUID()}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return { key };
};

const deleteS3Object = async (key: string) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key })
    );
  } catch {
    // Best-effort deletion; don't fail the request if S3 cleanup hiccups.
  }
};

const BOOKING_REF_PREFIX = "TRV-";

export const createNewBookingService = async (
  data: BookingInput,
  bookedBy: string
) => {
  try {
    const totalPrice = data.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const bookingRef = BOOKING_REF_PREFIX + nanoid(8).toUpperCase();

    const booking = await Booking.create({
      ...data,
      bookingRef,
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

export const updateOrderItemOperationsService = async (
  bookingId: string,
  itemIdx: number,
  data: OrderItemOperationsInput
) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw createError("Booking not found", 404);
    }

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const setOps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      setOps[`orderItems.${itemIdx}.operations.${key}`] = value;
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: setOps },
      { new: true }
    )
      .populate("clientId")
      .populate("orderItems.productId")
      .populate("orderItems.operations.controlCallPicId", "name email")
      .populate("orderItems.operations.picId", "name email")
      .populate("bookedBy", "name email")
      .lean();

    return updated;
  } catch (error) {
    throw error;
  }
};

export const assignGuideService = async (
  bookingId: string,
  itemIdx: number,
  data: AssignGuideInput,
  assignedBy: string
) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw createError("Booking not found", 404);

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const already = booking.orderItems[itemIdx].guideAssignments.some(
      (a) => a.supplierId.toString() === data.supplierId
    );
    if (already) {
      throw createError(
        "This guide is already assigned to this order item",
        409
      );
    }

    booking.orderItems[itemIdx].guideAssignments.push({
      supplierId: new mongoose.Types.ObjectId(data.supplierId),
      status: "invited",
      notes: data.notes,
      assignedAt: new Date(),
      assignedBy: new mongoose.Types.ObjectId(assignedBy),
    });
    booking.markModified(`orderItems.${itemIdx}.guideAssignments`);
    await booking.save();

    return getBookingByIdService(bookingId);
  } catch (error) {
    throw error;
  }
};

export const updateGuideAssignmentService = async (
  bookingId: string,
  itemIdx: number,
  assignmentId: string,
  data: UpdateGuideAssignmentInput
) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw createError("Booking not found", 404);

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const assignment = booking.orderItems[itemIdx].guideAssignments.find(
      (a) => (a as { _id: mongoose.Types.ObjectId })._id.toString() === assignmentId
    );
    if (!assignment) throw createError("Assignment not found", 404);

    if (data.status !== undefined) {
      assignment.status = data.status;
      if (
        data.status === "confirmed" ||
        data.status === "declined" ||
        data.status === "completed"
      ) {
        assignment.respondedAt = new Date();
      }
    }
    if (data.notes !== undefined) {
      assignment.notes = data.notes;
    }
    booking.markModified(`orderItems.${itemIdx}.guideAssignments`);
    await booking.save();

    return getBookingByIdService(bookingId);
  } catch (error) {
    throw error;
  }
};

export const removeGuideAssignmentService = async (
  bookingId: string,
  itemIdx: number,
  assignmentId: string
) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw createError("Booking not found", 404);

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const result = await Booking.updateOne(
      { _id: bookingId },
      {
        $pull: {
          [`orderItems.${itemIdx}.guideAssignments`]: { _id: assignmentId },
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw createError("Assignment not found", 404);
    }

    return getBookingByIdService(bookingId);
  } catch (error) {
    throw error;
  }
};

export const uploadClientItineraryService = async (
  bookingId: string,
  file: Express.Multer.File,
  uploadedBy: string
) => {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw createError("Booking not found", 404);

    const { key } = await uploadItineraryToS3(file, bookingId, "client");
    const previousKey = booking.clientItinerary?.key;

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { clientItinerary: buildItineraryRecord(file, key, uploadedBy) } },
      { new: true }
    );

    if (previousKey && previousKey !== key) {
      await deleteS3Object(previousKey);
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

export const deleteClientItineraryService = async (bookingId: string) => {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw createError("Booking not found", 404);

    const key = booking.clientItinerary?.key;
    if (!key) throw createError("No client itinerary to delete", 404);

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $unset: { clientItinerary: "" } },
      { new: true }
    );

    await deleteS3Object(key);

    return updated;
  } catch (error) {
    throw error;
  }
};

export const uploadGuideItineraryService = async (
  bookingId: string,
  itemIdx: number,
  file: Express.Multer.File,
  uploadedBy: string
) => {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw createError("Booking not found", 404);

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const { key } = await uploadItineraryToS3(
      file,
      bookingId,
      "guide",
      itemIdx
    );
    const previousKey = booking.orderItems[itemIdx]?.guideItinerary?.key;

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          [`orderItems.${itemIdx}.guideItinerary`]: buildItineraryRecord(
            file,
            key,
            uploadedBy
          ),
        },
      },
      { new: true }
    );

    if (previousKey && previousKey !== key) {
      await deleteS3Object(previousKey);
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

export const deleteGuideItineraryService = async (
  bookingId: string,
  itemIdx: number
) => {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw createError("Booking not found", 404);

    if (itemIdx < 0 || itemIdx >= booking.orderItems.length) {
      throw createError("Order item index out of range", 400);
    }

    const key = booking.orderItems[itemIdx]?.guideItinerary?.key;
    if (!key) throw createError("No guide itinerary to delete", 404);

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $unset: { [`orderItems.${itemIdx}.guideItinerary`]: "" },
      },
      { new: true }
    );

    await deleteS3Object(key);

    return updated;
  } catch (error) {
    throw error;
  }
};

export const getBookingByIdService = async (id: string) => {
  try {
    const booking = await Booking.findById(id)
      .populate("clientId")
      .populate("orderItems.productId")
      .populate("orderItems.operations.controlCallPicId", "name email")
      .populate("orderItems.operations.picId", "name email")
      .populate(
        "orderItems.guideAssignments.supplierId",
        "personalInfo.firstName personalInfo.lastName contact.email contact.mobile experience.guidingLanguages experience.guidingLocation status"
      )
      .populate("bookedBy", "name email")
      .lean();

    if (!booking) {
      throw createError("Booking not found", 404);
    }

    return booking;
  } catch (error) {
    throw error;
  }
};
