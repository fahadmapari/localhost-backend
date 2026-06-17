import { nanoid } from "nanoid";
import path from "path";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/config/s3";
import { S3_BUCKET_NAME } from "@/config/env";
import { db } from "@/db";
import { bookings, bookingOrderItems, guideAssignments } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import {
  AssignGuideInput,
  BookingInput,
  OrderItemOperationsInput,
  UpdateGuideAssignmentInput,
} from "@/schema/booking.schema";
import { createError } from "@/utils/errorHandlers";

type ItineraryKind = "client" | "guide";

const buildItineraryRecord = (file: Express.Multer.File, key: string, uploadedBy: string) => ({
  key,
  filename: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  uploadedAt: new Date().toISOString(),
  uploadedBy,
});

const uploadItineraryToS3 = async (
  file: Express.Multer.File,
  bookingId: string,
  kind: ItineraryKind,
  itemIdx?: number,
): Promise<{ key: string }> => {
  const ext = path.extname(file.originalname);
  const suffix = kind === "guide" ? `-item-${itemIdx}` : "";
  const key = `bookings/${bookingId}/itinerary-${kind}${suffix}-${randomUUID()}${ext}`;

  await s3Client.send(
    new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key, Body: file.buffer, ContentType: file.mimetype }),
  );

  return { key };
};

const deleteS3Object = async (key: string) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
  } catch {
    // Best-effort deletion
  }
};

const BOOKING_REF_PREFIX = "TRV-";

export const createNewBookingService = async (data: BookingInput, bookedBy: string) => {
  const totalPrice = data.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const bookingRef = BOOKING_REF_PREFIX + nanoid(8).toUpperCase();

  return db.transaction(async (tx) => {
    const [booking] = await tx
      .insert(bookings)
      .values({
        bookingRef,
        clientId: data.clientId,
        leadFirstName: data.leadFirstName,
        leadLastName: data.leadLastName,
        leadEmail: data.leadEmail,
        leadMobile: data.leadMobile,
        agencyRef: data.agencyRef,
        comments: data.comments,
        discountCode: data.discountCode,
        totalPrice: String(totalPrice),
        bookedFrom: "admin",
        bookedBy,
      })
      .returning();

    if (data.orderItems.length > 0) {
      await tx.insert(bookingOrderItems).values(
        data.orderItems.map((item, idx) => ({
          bookingId: booking.id,
          position: idx,
          productId: item.productId,
          productTitle: item.productTitle,
          quantity: item.quantity,
          price: String(item.price),
          paxCount: item.paxCount,
          meetingPoint: item.meetingPoint,
          endPoint: item.endPoint,
          startTime: item.startTime,
          duration: String(item.duration),
          details: item.details,
          date: item.date instanceof Date ? item.date.toISOString().split("T")[0] : item.date,
        })),
      );
    }

    return booking;
  });
};

export const getBookingsService = async (page: number, limit: number) => {
  const [bookingRows, [{ total }]] = await Promise.all([
    db.query.bookings.findMany({
      with: { client: true },
      orderBy: [desc(bookings.createdAt)],
      limit,
      offset: page * limit,
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(bookings),
  ]);

  return { bookings: bookingRows, total };
};

export const updateOrderItemOperationsService = async (
  bookingId: string,
  itemIdx: number,
  data: OrderItemOperationsInput,
) => {
  const item = await db.query.bookingOrderItems.findFirst({
    where: and(eq(bookingOrderItems.bookingId, bookingId), eq(bookingOrderItems.position, itemIdx)),
  });

  if (!item) throw createError("Order item index out of range", 400);

  const currentOps = (item.operations as Record<string, unknown>) ?? {};
  const updatedOps = { ...currentOps, ...data };

  await db
    .update(bookingOrderItems)
    .set({ operations: updatedOps })
    .where(eq(bookingOrderItems.id, item.id));

  return getBookingByIdService(bookingId);
};

export const assignGuideService = async (
  bookingId: string,
  itemIdx: number,
  data: AssignGuideInput,
  assignedBy: string,
) => {
  const item = await db.query.bookingOrderItems.findFirst({
    where: and(eq(bookingOrderItems.bookingId, bookingId), eq(bookingOrderItems.position, itemIdx)),
    with: { guideAssignments: true },
  });

  if (!item) throw createError("Order item index out of range", 400);

  const already = item.guideAssignments.some((a) => a.supplierId === data.supplierId);
  if (already) throw createError("This guide is already assigned to this order item", 409);

  await db.insert(guideAssignments).values({
    orderItemId: item.id,
    supplierId: data.supplierId,
    status: "invited",
    notes: data.notes,
    assignedBy,
  });

  return getBookingByIdService(bookingId);
};

export const updateGuideAssignmentService = async (
  bookingId: string,
  itemIdx: number,
  assignmentId: string,
  data: UpdateGuideAssignmentInput,
) => {
  const assignment = await db.query.guideAssignments.findFirst({
    where: eq(guideAssignments.id, assignmentId),
  });

  if (!assignment) throw createError("Assignment not found", 404);

  const updateData: Partial<typeof guideAssignments.$inferInsert> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
    if (["confirmed", "declined", "completed"].includes(data.status)) {
      updateData.respondedAt = new Date();
    }
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  await db.update(guideAssignments).set(updateData).where(eq(guideAssignments.id, assignmentId));

  return getBookingByIdService(bookingId);
};

export const removeGuideAssignmentService = async (
  bookingId: string,
  itemIdx: number,
  assignmentId: string,
) => {
  const result = await db
    .delete(guideAssignments)
    .where(eq(guideAssignments.id, assignmentId))
    .returning();

  if (result.length === 0) throw createError("Assignment not found", 404);

  return getBookingByIdService(bookingId);
};

export const uploadClientItineraryService = async (
  bookingId: string,
  file: Express.Multer.File,
  uploadedBy: string,
) => {
  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!booking) throw createError("Booking not found", 404);

  const { key } = await uploadItineraryToS3(file, bookingId, "client");
  const previousKey = (booking.clientItinerary as any)?.key;

  const [updated] = await db
    .update(bookings)
    .set({ clientItinerary: buildItineraryRecord(file, key, uploadedBy) })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (previousKey && previousKey !== key) await deleteS3Object(previousKey);
  return updated;
};

export const deleteClientItineraryService = async (bookingId: string) => {
  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!booking) throw createError("Booking not found", 404);

  const key = (booking.clientItinerary as any)?.key;
  if (!key) throw createError("No client itinerary to delete", 404);

  const [updated] = await db
    .update(bookings)
    .set({ clientItinerary: null })
    .where(eq(bookings.id, bookingId))
    .returning();

  await deleteS3Object(key);
  return updated;
};

export const uploadGuideItineraryService = async (
  bookingId: string,
  itemIdx: number,
  file: Express.Multer.File,
  uploadedBy: string,
) => {
  const item = await db.query.bookingOrderItems.findFirst({
    where: and(eq(bookingOrderItems.bookingId, bookingId), eq(bookingOrderItems.position, itemIdx)),
  });

  if (!item) throw createError("Order item index out of range", 400);

  const { key } = await uploadItineraryToS3(file, bookingId, "guide", itemIdx);
  const previousKey = (item.guideItinerary as any)?.key;

  await db
    .update(bookingOrderItems)
    .set({ guideItinerary: buildItineraryRecord(file, key, uploadedBy) })
    .where(eq(bookingOrderItems.id, item.id));

  if (previousKey && previousKey !== key) await deleteS3Object(previousKey);
  return getBookingByIdService(bookingId);
};

export const deleteGuideItineraryService = async (bookingId: string, itemIdx: number) => {
  const item = await db.query.bookingOrderItems.findFirst({
    where: and(eq(bookingOrderItems.bookingId, bookingId), eq(bookingOrderItems.position, itemIdx)),
  });

  if (!item) throw createError("Order item index out of range", 400);

  const key = (item.guideItinerary as any)?.key;
  if (!key) throw createError("No guide itinerary to delete", 404);

  await db
    .update(bookingOrderItems)
    .set({ guideItinerary: null })
    .where(eq(bookingOrderItems.id, item.id));

  await deleteS3Object(key);
  return getBookingByIdService(bookingId);
};

export const getBookingByIdService = async (id: string) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, id),
    with: {
      client: true,
      bookedByUser: { columns: { name: true, email: true } },
      orderItems: {
        orderBy: [bookingOrderItems.position],
        with: {
          product: true,
          guideAssignments: {
            with: {
              supplier: {
                columns: {
                  id: true,
                  personalInfo: true,
                  contact: true,
                  experience: true,
                  status: true,
                },
              },
              assignedByUser: { columns: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!booking) throw createError("Booking not found", 404);
  return booking;
};
