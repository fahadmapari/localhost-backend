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
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "super admin",
  "admin",
  "client",
  "supplier",
]);

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
export const priceModelEnum = pgEnum("price_model", [
  "fixed rate",
  "per pax",
]);
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

export const supplierStatusEnum = pgEnum("supplier_status", [
  "Active",
  "Inactive",
  "Pending",
  "Suspended",
]);

export const preferredPaymentMethodEnum = pgEnum("preferred_payment_method", [
  "Bank transfer",
  "Net banking",
  "Credit card",
]);
export const clientCurrencyEnum = pgEnum("client_currency", [
  "EUR",
  "USD",
  "INR",
]);
export const paymentAgreementEnum = pgEnum("payment_agreement", [
  "Pre-Service",
  "Post-Service",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const usersRelations = relations(users, ({ many, one }) => ({
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

// ─── Client Profiles ─────────────────────────────────────────────────────────
// Replaces the Mongoose discriminator Profile/ClientProfile

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
  // { name, address, zipCode, country, city, PreferredPaymentMethod,
  //   telephone, fax, VATNumber, website, email, preferredLanguage,
  //   currency, associationName, paymentAgreement }
  companyInformation: jsonb("company_information"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const clientProfilesRelations = relations(clientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [clientProfiles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

// ─── Products ─────────────────────────────────────────────────────────────────

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

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  bookingOrderItems: many(bookingOrderItems),
}));

// ─── Product Variants ─────────────────────────────────────────────────────────

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

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  baseProduct: one(products, {
    fields: [productVariants.baseProductId],
    references: [products.id],
  }),
  remarks: many(productRemarks),
}));

// ─── Product Remarks ──────────────────────────────────────────────────────────

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

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  lastMessageId: uuid("last_message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

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

// ─── Conversation Participants (junction) ─────────────────────────────────────

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })],
);

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

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

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

// ─── Bookings ─────────────────────────────────────────────────────────────────

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

// ─── Booking Order Items ──────────────────────────────────────────────────────

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

// ─── Guide Assignments ────────────────────────────────────────────────────────

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

// ─── Subscriptions ────────────────────────────────────────────────────────────

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
  paymentMethod: subscriptionPaymentMethodEnum("payment_method").default("credit card").notNull(),
  status: subscriptionStatusEnum("status").default("active"),
  startDate: date("start_date").notNull(),
  renewalDate: date("renewal_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// ─── Suppliers ────────────────────────────────────────────────────────────────
// Complex nested data stored as jsonb to avoid 10+ junction tables.
// Arrays (addresses, rateTiers, etc.) only ever read/written as a unit per supplier.

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // { title, firstName, lastName, gender, dateOfBirth, nationality,
    //   familyStatus, birthPlace, remunerationExpectation, availabilityTime,
    //   howDidYouHearAboutUs, typeOfServicesProvided, transportationDetail,
    //   hobbies, memberOfAssociation, associationName }
    personalInfo: jsonb("personal_info").notNull(),
    // Array of { streetAndNumber, city, municipality, district, state,
    //            country, postalCode, isPrimary }
    addresses: jsonb("addresses").default([]),
    // { preferredFormOfContact, email, alternateEmail, mobile, officePhone,
    //   homePhone, otherPhone, fax, whatsapp, skype, website, socialMedia,
    //   tripAdvisor, profileVideo, otherProfile, sampleTourVideo, review }
    contact: jsonb("contact").notNull(),
    // { shortDescription, aboutYourself, references, yearsOfExperience,
    //   nonFormalEducation, formalEducation, professionalCourses, tourType,
    //   tourTopic, guidingLocation[], guidingLanguages[] }
    experience: jsonb("experience"),
    // { bic, taxNo, vatNo, vat, bankAccountHolder, iban, currency,
    //   otherPaymentOptions, vatType }
    billing: jsonb("billing"),
    // { contractStartDate, contractEndDate, serviceType, rateTiers[] }
    contract: jsonb("contract"),
    // Array of { type, value, percentage }
    cancellationTerms: jsonb("cancellation_terms").default([]),
    // Array of { durationType, value, rateType, rateValue, weekendsIncluded,
    //            publicHolidayIncluded }
    amendments: jsonb("amendments").default([]),
    // Array of { guidingLocation, locationSupplement }
    locationSupplements: jsonb("location_supplements").default([]),
    // Array of { guidingLanguage, languageSupplement }
    languageSupplements: jsonb("language_supplements").default([]),
    // { identificationNumber, photoUpload, cvUpload, licenced, insured,
    //   criminalRecord, contracted, whisperSystem, vatAmount, commission }
    docs: jsonb("docs"),
    // { extraHour, workingDays, workingMonths, workingHoursStartTime,
    //   workingHoursEndTime, supplementNeeded, meetingPointNotCentralSupplement,
    //   publicTransportSupplementRateInEUR, paymentAgreement,
    //   callOffTimeInDaysBeforeService, maxPax, alsoFax }
    serviceConfig: jsonb("service_config"),
    // { averageRating, totalReviews }
    rating: jsonb("rating").default({ averageRating: 0, totalReviews: 0 }),
    comments: text("comments"),
    autoBookings: boolean("auto_bookings").default(false),
    employee: boolean("employee").default(false),
    status: supplierStatusEnum("status").default("Pending"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("suppliers_status_idx").on(t.status),
    index("suppliers_created_at_idx").on(t.createdAt),
  ],
);

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

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type ProductRemark = typeof productRemarks.$inferSelect;
export type NewProductRemark = typeof productRemarks.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type BookingOrderItem = typeof bookingOrderItems.$inferSelect;
export type NewBookingOrderItem = typeof bookingOrderItems.$inferInsert;

export type GuideAssignment = typeof guideAssignments.$inferSelect;
export type NewGuideAssignment = typeof guideAssignments.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
