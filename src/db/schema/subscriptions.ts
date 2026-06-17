import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  numeric,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const subscriptionFrequencyEnum = pgEnum("subscription_frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);
export const subscriptionCurrencyEnum = pgEnum("subscription_currency", [
  "USD",
  "EUR",
  "GBP",
  "INR",
]);
export const subscriptionCategoryEnum = pgEnum("subscription_category", [
  "sports",
  "entertainment",
  "travel",
  "others",
  "food",
]);
export const subscriptionPaymentMethodEnum = pgEnum(
  "subscription_payment_method",
  ["credit card", "net banking", "paypal", "cash"],
);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "inactive",
  "cancelled",
  "expired",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  frequency: subscriptionFrequencyEnum("frequency").default("monthly"),
  currency: subscriptionCurrencyEnum("currency").default("INR"),
  category: subscriptionCategoryEnum("category").default("others").notNull(),
  paymentMethod: subscriptionPaymentMethodEnum("payment_method")
    .default("credit card")
    .notNull(),
  status: subscriptionStatusEnum("status").default("active"),
  startDate: date("start_date").notNull(),
  renewalDate: date("renewal_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
