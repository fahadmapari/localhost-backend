import { relations } from "drizzle-orm";
import { users } from "./users";
import { clientProfiles } from "./clients";
import { products, productVariants, productRemarks } from "./products";
import { conversations, conversationParticipants, messages } from "./conversations";
import { bookings, bookingOrderItems, guideAssignments } from "./bookings";
import { subscriptions } from "./subscriptions";
import { suppliers } from "./suppliers";

export const usersRelations = relations(users, ({ one, many }) => ({
  clientProfile: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.userId],
  }),
  subscriptions: many(subscriptions),
  productRemarks: many(productRemarks),
  conversationsCreated: many(conversations),
  conversationParticipants: many(conversationParticipants),
  messagesSent: many(messages),
  bookingsCreated: many(bookings),
  suppliersCreated: many(suppliers, { relationName: "supplierCreatedBy" }),
  suppliersUpdated: many(suppliers, { relationName: "supplierUpdatedBy" }),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [clientProfiles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  bookingOrderItems: many(bookingOrderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  baseProduct: one(products, {
    fields: [productVariants.baseProductId],
    references: [products.id],
  }),
  remarks: many(productRemarks),
}));

export const productRemarksRelations = relations(productRemarks, ({ one }) => ({
  productVariant: one(productVariants, {
    fields: [productRemarks.productVariantId],
    references: [productVariants.id],
  }),
  author: one(users, {
    fields: [productRemarks.authorId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  creator: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  lastMessage: one(messages, {
    fields: [conversations.lastMessageId],
    references: [messages.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(clientProfiles, {
    fields: [bookings.clientId],
    references: [clientProfiles.id],
  }),
  bookedByUser: one(users, {
    fields: [bookings.bookedBy],
    references: [users.id],
  }),
  orderItems: many(bookingOrderItems),
}));

export const bookingOrderItemsRelations = relations(bookingOrderItems, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [bookingOrderItems.bookingId],
    references: [bookings.id],
  }),
  product: one(products, {
    fields: [bookingOrderItems.productId],
    references: [products.id],
  }),
  guideAssignments: many(guideAssignments),
}));

export const guideAssignmentsRelations = relations(guideAssignments, ({ one }) => ({
  orderItem: one(bookingOrderItems, {
    fields: [guideAssignments.orderItemId],
    references: [bookingOrderItems.id],
  }),
  supplier: one(suppliers, {
    fields: [guideAssignments.supplierId],
    references: [suppliers.id],
  }),
  assignedByUser: one(users, {
    fields: [guideAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
    relationName: "supplierCreatedBy",
  }),
  updatedByUser: one(users, {
    fields: [suppliers.updatedBy],
    references: [users.id],
    relationName: "supplierUpdatedBy",
  }),
  guideAssignments: many(guideAssignments),
}));
