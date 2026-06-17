import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const embeddingStatusEnum = pgEnum("embedding_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const serviceTypeEnum = pgEnum("service_type", ["guide", "assistant"]);
export const tourTypeEnum = pgEnum("tour_type", ["shared", "private"]);
export const activityTypeEnum = pgEnum("activity_type", ["city tours"]);
export const subTypeEnum = pgEnum("sub_type", ["walking tours"]);
export const bookingTypeEnum = pgEnum("booking_type", ["instant", "request"]);
export const activitySuitableForEnum = pgEnum("activity_suitable_for", [
  "all",
  "adults",
  "children",
]);
export const voucherTypeEnum = pgEnum("voucher_type", [
  "printed or e-voucher accepted",
  "printed",
  "e-voucher accepted",
]);
export const priceModelEnum = pgEnum("price_model", ["fixed rate", "per pax"]);
export const productCurrencyEnum = pgEnum("product_currency", [
  "USD",
  "EUR",
  "GBP",
  "INR",
]);
export const durationUnitEnum = pgEnum("duration_unit", [
  "minutes",
  "hours",
  "days",
]);
export const tourTextLanguageEnum = pgEnum("tour_text_language", ["english"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  tourTextLanguage: tourTextLanguageEnum("tour_text_language").default("english"),
  tourGuideLanguageInstant: text("tour_guide_language_instant").array().default([]),
  tourGuideLanguageOnRequest: text("tour_guide_language_on_request").array().notNull(),
  images: text("images").array().notNull(),
  embeddingStatus: embeddingStatusEnum("embedding_status").default("pending"),
  embeddingLastError: text("embedding_last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: varchar("url", { length: 500 }).notNull(),
    productCode: varchar("product_code", { length: 100 }).notNull(),
    serviceType: serviceTypeEnum("service_type").default("guide"),
    tourType: tourTypeEnum("tour_type").default("private"),
    activityType: activityTypeEnum("activity_type").default("city tours"),
    subType: subTypeEnum("sub_type").default("walking tours"),
    description: text("description").notNull(),
    willSee: text("will_see").array().notNull(),
    willLearn: text("will_learn").array().notNull(),
    baseProductId: uuid("base_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    bookingType: bookingTypeEnum("booking_type"),
    tourGuideLanguage: varchar("tour_guide_language", { length: 100 }),
    mandatoryInformation: text("mandatory_information").array().notNull(),
    recommendedInformation: text("recommended_information").array().notNull(),
    included: text("included").array().notNull(),
    excluded: text("excluded").array().default([]),
    activitySuitableFor: activitySuitableForEnum("activity_suitable_for").default("all"),
    voucherType: voucherTypeEnum("voucher_type").default("printed or e-voucher accepted"),
    maxPax: integer("max_pax").notNull(),
    // { country, city, latitude, longitude, text, pickupInstructions }
    meetingPoint: jsonb("meeting_point").notNull(),
    // { latitude, longitude, text }
    endPoint: jsonb("end_point"),
    tags: text("tags").array().notNull(),
    closedDates: date("closed_dates").array().default([]),
    holidayDates: date("holiday_dates").array().default([]),
    // { isAlwaysAvailable, startDate, endDate, startTime, endTime, duration: { value, unit } }
    availability: jsonb("availability").notNull(),
    cancellationTerms: text("cancellation_terms").array().notNull(),
    release: varchar("release", { length: 100 }).notNull(),
    firstRoundReview: boolean("first_round_review").default(false).notNull(),
    firstRoundReviewRemarks: text("first_round_review_remarks").array().default([]),
    secondRoundReview: boolean("second_round_review").default(false).notNull(),
    secondRoundReviewRemarks: text("second_round_review_remarks").array().default([]),
    priceModel: priceModelEnum("price_model").default("fixed rate"),
    currency: productCurrencyEnum("currency").default("EUR"),
    b2bRateInstant: numeric("b2b_rate_instant", { precision: 10, scale: 2 }).notNull(),
    b2bExtraHourSupplementInstant: numeric("b2b_extra_hour_supplement_instant", { precision: 10, scale: 2 }).default("0"),
    b2bRateOnRequest: numeric("b2b_rate_on_request", { precision: 10, scale: 2 }).notNull(),
    b2bExtraHourSupplementOnRequest: numeric("b2b_extra_hour_supplement_on_request", { precision: 10, scale: 2 }).default("0"),
    b2cRateInstant: numeric("b2c_rate_instant", { precision: 10, scale: 2 }).notNull(),
    b2cExtraHourSupplementInstant: numeric("b2c_extra_hour_supplement_instant", { precision: 10, scale: 2 }).default("0"),
    b2cRateOnRequest: numeric("b2c_rate_on_request", { precision: 10, scale: 2 }).notNull(),
    b2cExtraHourSupplementOnRequest: numeric("b2c_extra_hour_supplement_on_request", { precision: 10, scale: 2 }).default("0"),
    publicHolidaySupplementPercent: numeric("public_holiday_supplement_percent", { precision: 5, scale: 2 }),
    weekendSupplementPercent: numeric("weekend_supplement_percent", { precision: 5, scale: 2 }),
    isB2B: boolean("is_b2b").default(true).notNull(),
    isB2C: boolean("is_b2c").default(true).notNull(),
    overridePriceFromContract: boolean("override_price_from_contract").default(false).notNull(),
    isBookingPerProduct: boolean("is_booking_per_product").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("product_variants_url_idx").on(t.url),
    uniqueIndex("product_variants_product_code_idx").on(t.productCode),
  ],
);

export const productRemarks = pgTable(
  "product_remarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: varchar("text", { length: 2000 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("product_remarks_variant_created_idx").on(t.productVariantId, t.createdAt)],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type ProductRemark = typeof productRemarks.$inferSelect;
export type NewProductRemark = typeof productRemarks.$inferInsert;
