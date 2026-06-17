import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const clientCurrencyEnum = pgEnum("client_currency", [
  "EUR",
  "USD",
  "INR",
]);

export const paymentAgreementEnum = pgEnum("payment_agreement", [
  "Pre-Service",
  "Post-Service",
]);

export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: boolean("status").default(false).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  // { code, number }
  mobile: jsonb("mobile").notNull(),
  // { code, number }
  whatsapp: jsonb("whatsapp").notNull(),
  teamsId: varchar("teams_id", { length: 255 }).notNull(),
  position: varchar("position", { length: 100 }),
  boardedFromOnlinePortal: boolean("boarded_from_online_portal").default(true),
  companyInformation: jsonb("company_information"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
