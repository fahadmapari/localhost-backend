import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
