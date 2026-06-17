import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { clientProfiles } from "./clients";
import { products } from "./products";
import { suppliers } from "./suppliers";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);
export const bookedFromEnum = pgEnum("booked_from", ["website", "admin"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "partiallyPaid",
]);
export const guideAssignmentStatusEnum = pgEnum("guide_assignment_status", [
  "invited",
  "confirmed",
  "declined",
  "completed",
]);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingRef: varchar("booking_ref", { length: 50 }).notNull(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientProfiles.id),
    leadFirstName: varchar("lead_first_name", { length: 100 }).notNull(),
    leadLastName: varchar("lead_last_name", { length: 100 }).notNull(),
    leadEmail: varchar("lead_email", { length: 255 }).notNull(),
    // { countryCode, number }
    leadMobile: jsonb("lead_mobile").notNull(),
    agencyRef: varchar("agency_ref", { length: 100 }),
    comments: text("comments"),
    discountCode: varchar("discount_code", { length: 100 }),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    status: bookingStatusEnum("status").default("pending"),
    bookedFrom: bookedFromEnum("booked_from").default("website"),
    bookedBy: uuid("booked_by").references(() => users.id),
    paymentStatus: paymentStatusEnum("payment_status").default("unpaid"),
    // { key, filename, mimeType, size, uploadedAt, uploadedBy }
    clientItinerary: jsonb("client_itinerary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("bookings_ref_idx").on(t.bookingRef)],
);

export const bookingOrderItems = pgTable("booking_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productTitle: varchar("product_title", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  paxCount: integer("pax_count").notNull(),
  meetingPoint: text("meeting_point").notNull(),
  endPoint: text("end_point").notNull(),
  startTime: varchar("start_time", { length: 20 }).notNull(),
  duration: numeric("duration", { precision: 8, scale: 2 }).notNull(),
  details: text("details"),
  date: date("date").notNull(),
  // { internalComment, accountingComment, transportDetails, supplierRemark,
  //   finalDetailsToProvider, finalDetailsByEmail, finalDetailsToClient,
  //   controlCallPicId, picId }
  operations: jsonb("operations"),
  // { key, filename, mimeType, size, uploadedAt, uploadedBy }
  guideItinerary: jsonb("guide_itinerary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const guideAssignments = pgTable("guide_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => bookingOrderItems.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  status: guideAssignmentStatusEnum("status").default("invited"),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  assignedBy: uuid("assigned_by").references(() => users.id),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type BookingOrderItem = typeof bookingOrderItems.$inferSelect;
export type NewBookingOrderItem = typeof bookingOrderItems.$inferInsert;

export type GuideAssignment = typeof guideAssignments.$inferSelect;
export type NewGuideAssignment = typeof guideAssignments.$inferInsert;
