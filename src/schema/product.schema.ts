import { z } from "zod";
import languages from "../assets/json/languages.v1.json" with { type: "json" };
import { timeToMinutes } from "../utils/common";

function preprocessToArray<T extends z.ZodArray<z.ZodTypeAny>>(arraySchema: T) {
  return z.preprocess(
    (arg) => {
      // If the input is a string, wrap it in an array.
      // Example: "hello" becomes ["hello"]
      if (typeof arg === "string") {
        return [arg];
      }
      // If the input is undefined, return an empty array.
      // Example: undefined becomes []
      if (typeof arg === "undefined") {
        return [];
      }
      // For all other types (e.g., already an array, null, number, boolean, object),
      // pass them through directly to the arraySchema for further validation.
      // If 'arg' is not an array, the provided arraySchema will then throw a validation error.
      return arg;
    },
    arraySchema // Now directly using the provided arraySchema
  );
}

const meetingPointSchema = z.object({
  country: z.string("Country is required."),
  city: z.string("City is required."),
  latitude: z.coerce
    .number("Latitude is required.")
    .min(-90, "Latitude must be greater than or equal to -90")
    .max(90, "Latitude must be less than or equal to 90"),
  longitude: z.coerce
    .number("Longitude is required.")
    .min(-180, "Longitude must be greater than or equal to -180")
    .max(180, "Longitude must be less than or equal to 180"),
  text: z.string().min(1, "Meeting point text is required."),
  pickupInstructions: preprocessToArray(z.array(z.string())).optional(),
});

const endPointSchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  text: z.string(),
});

const availabilitySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required."),
    duration: z.object({
      value: z.coerce.number("Duration value is required."),
      unit: z.enum(["minutes", "hours", "days"]),
    }),
  })
  .transform((data) => {
    // If no start or end date is provided, and isAlwaysAvailable is not already set,
    // default it to true.
    if (data.startDate === undefined && data.endDate === undefined) {
      return { ...data, isAlwaysAvailable: true };
    }
    return data;
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return data.startDate <= data.endDate;
    },
    {
      error: "Start date must be before end date.",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      return timeToMinutes(data.startTime) < timeToMinutes(data.endTime);
    },
    {
      error: "Start time must be before end time.",
      path: ["startTime"],
    }
  );

export const productZodSchema = z.object({
  title: z.string().min(1, "Title is required."),
  serviceType: z.enum(["guide", "assistant"]),
  tourType: z.enum(["shared", "private"]),
  activityType: z.enum(["city tours"]),
  subType: z.enum(["walking tours"]),
  description: z.string().min(1, "Description is required."),
  willSee: preprocessToArray(
    z.array(z.string()).min(1, "At least one 'will see' item is required.")
  ),
  willLearn: preprocessToArray(
    z.array(z.string()).min(1, "At least one 'will learn' item is required.")
  ),
  tourTextLanguage: z.enum(["english"]),
  tourGuideLanguageInstant: preprocessToArray(
    z.array(z.enum([...Object.values(languages)]))
  ).optional(),
  tourGuideLanguageOnRequest: preprocessToArray(
    z
      .array(z.enum([...Object.values(languages)]))
      .min(1, "At least one 'tour guide language' item is required.")
  ),
  mandatoryInformation: preprocessToArray(
    z
      .array(z.string())
      .min(1, "At least one mandatory information is required.")
  ),
  recommdendedInformation: preprocessToArray(
    z
      .array(z.string())
      .min(1, "At least one recommended information is required.")
  ),
  included: preprocessToArray(
    z.array(z.string()).min(1, "At least one included item is required.")
  ),
  excluded: preprocessToArray(
    z.array(z.string()).min(1, "At least one excluded item is required.")
  ),
  activitySuitableFor: z.enum(["all", "adults", "children"]),
  voucherType: z.enum([
    "printed or e-voucher accepted",
    "printed",
    "e-voucher accepted",
  ]),
  maxPax: z.coerce
    .number("Max pax is required.")
    .positive("Max pax must be a positive number."),
  meetingPoint: meetingPointSchema,
  endPoint: endPointSchema.optional(),
  tags: preprocessToArray(
    z
      .array(
        z.enum([
          "walk",
          "museum",
          "palace",
          "science",
          "technology",
          "beer",
          "christmas",
        ])
      )
      .min(1, "At least one tag is required.")
  ),
  priceModel: z.enum(["fixed rate", "per pax"]),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]),
  b2bRateInstant: z.coerce.number("B2B Instant rate is required."),
  b2bExtraHourSupplementInsant: z.coerce.number().optional(),
  b2bRateOnRequest: z.coerce.number("B2B On Request rate is required."),
  b2bExtraHourSupplementOnRequest: z.coerce.number().optional(),

  b2cRateInstant: z.coerce.number("B2C Instant rate is required."),
  b2cExtraHourSupplementInstant: z.coerce.number().optional(),
  b2cRateOnRequest: z.coerce.number("B2C On Request rate is required."),
  b2cExtraHourSupplementOnRequest: z.coerce.number().optional(),
  closedDates: preprocessToArray(z.array(z.coerce.date())).optional(),
  holidayDates: preprocessToArray(z.array(z.coerce.date())).optional(),

  publicHolidaySupplementPercent: z.coerce.number(),
  weekendSupplementPercent: z.coerce.number(),
  availability: availabilitySchema,
  cancellationTerms: preprocessToArray(
    z.array(z.string()).min(1, "At least one cancellation term is required.")
  ),
  realease: z.string().min(1, "Realease is required."),
  isB2B: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  isB2C: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  overridePriceFromContract: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  isBookingPerProduct: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
});

export const editProductZodSchema = z.object({
  productCode: z.string().min(1, "Product code is required."),
  baseProductId: z.string().min(1, "Base product id is required."),
  id: z.string().min(1, "Product id is required."),
  title: z.string().min(1, "Title is required."),
  serviceType: z.enum(["guide", "assistant"]),
  tourType: z.enum(["shared", "private"]),
  activityType: z.enum(["city tours"]),
  subType: z.enum(["walking tours"]),
  description: z.string().min(1, "Description is required."),
  willSee: preprocessToArray(
    z.array(z.string()).min(1, "At least one 'will see' item is required.")
  ),
  willLearn: preprocessToArray(
    z.array(z.string()).min(1, "At least one 'will learn' item is required.")
  ),
  bookingType: z.enum(["instant", "request"]),
  existingImages: preprocessToArray(z.array(z.string())).optional(),
  tourTextLanguage: z.enum(["english"]),
  tourGuideLanguage: z.string().min(1, "Tour guide language is required."),
  tourGuideLanguageInstant: preprocessToArray(
    z.array(z.enum([...Object.values(languages)]))
  ).optional(),
  tourGuideLanguageOnRequest: preprocessToArray(
    z
      .array(z.enum([...Object.values(languages)]))
      .min(1, "At least one 'tour guide language' item is required.")
  ),
  mandatoryInformation: preprocessToArray(
    z
      .array(z.string())
      .min(1, "At least one mandatory information is required.")
  ),
  recommdendedInformation: preprocessToArray(
    z
      .array(z.string())
      .min(1, "At least one recommended information is required.")
  ),
  included: preprocessToArray(
    z.array(z.string()).min(1, "At least one included item is required.")
  ),
  excluded: preprocessToArray(
    z.array(z.string()).min(1, "At least one excluded item is required.")
  ),
  activitySuitableFor: z.enum(["all", "adults", "children"]),
  voucherType: z.enum([
    "printed or e-voucher accepted",
    "printed",
    "e-voucher accepted",
  ]),
  maxPax: z.coerce
    .number("Max pax is required.")
    .positive("Max pax must be a positive number."),
  meetingPoint: meetingPointSchema,
  endPoint: endPointSchema.optional(),
  tags: preprocessToArray(
    z
      .array(
        z.enum([
          "walk",
          "museum",
          "palace",
          "science",
          "technology",
          "beer",
          "christmas",
        ])
      )
      .min(1, "At least one tag is required.")
  ),
  priceModel: z.enum(["fixed rate", "per pax"]),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]),
  b2bRateInstant: z.coerce.number("B2B Instant rate is required."),
  b2bExtraHourSupplementInsant: z.coerce.number().optional(),
  b2bRateOnRequest: z.coerce.number("B2B On Request rate is required."),
  b2bExtraHourSupplementOnRequest: z.coerce.number().optional(),

  b2cRateInstant: z.coerce.number("B2C Instant rate is required."),
  b2cExtraHourSupplementInstant: z.coerce.number().optional(),
  b2cRateOnRequest: z.coerce.number("B2C On Request rate is required."),
  b2cExtraHourSupplementOnRequest: z.coerce.number().optional(),
  closedDates: preprocessToArray(z.array(z.coerce.date())).optional(),
  holidayDates: preprocessToArray(z.array(z.coerce.date())).optional(),

  publicHolidaySupplementPercent: z.coerce.number(),
  weekendSupplementPercent: z.coerce.number(),
  availability: availabilitySchema,
  cancellationTerms: preprocessToArray(
    z.array(z.string()).min(1, "At least one cancellation term is required.")
  ),
  realease: z.string().min(1, "Realease is required."),
  isB2B: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  isB2C: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  overridePriceFromContract: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
  isBookingPerProduct: z.union([
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false),
    z.boolean(),
  ]),
});

export type ProductType = z.infer<typeof productZodSchema>;
