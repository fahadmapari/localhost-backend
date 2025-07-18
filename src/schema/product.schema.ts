import { z } from "zod";
import languages from "../assets/json/languages.v1.json" assert { type: "json" };

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
  pickupInstructions: z.array(z.string()).optional(),
});

const endPointSchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  text: z.string().optional(),
});

const availabilitySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  duration: z.object({
    value: z.coerce.number("Duration value is required."),
    unit: z.enum(["minutes", "hours", "days"]),
  }),
});

export const productZodSchema = z.object({
  title: z.string().min(1, "Title is required."),
  serviceType: z.enum(["guide", "assistant"]),
  tourType: z.enum(["shared", "private"]),
  activityType: z.enum(["city tours"]),
  subType: z.enum(["walking tours"]),
  description: z.string().min(1, "Description is required."),
  willSee: z
    .array(z.string())
    .min(1, "At least one 'will see' item is required."),
  willLearn: z
    .array(z.string())
    .min(1, "At least one 'will learn' item is required."),
  tourTextLanguage: z.enum(["english"]),
  bookingType: z.enum(["instant", "request"]),
  tourGuideLanguageInstant: z
    .array(z.enum([...Object.values(languages)]))
    .optional(),
  tourGuideLanguageOnRequest: z
    .array(z.enum([...Object.values(languages)]))
    .min(1, "At least one 'tour guide language' item is required."),
  mandatoryInformation: z
    .array(z.string())
    .min(1, "At least one mandatory information is required."),
  recommdendedInformation: z
    .array(z.string())
    .min(1, "At least one recommended information is required."),
  included: z
    .array(z.string())
    .min(1, "At least one included item is required."),
  excluded: z
    .array(z.string())
    .min(1, "At least one excluded item is required."),
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
  tags: z
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
    .min(1, "At least one tag is required."),
  images: z
    .array(
      z.object().transform((val) =>
        z
          .file(val)
          .mime(["image/jpeg", "image/png", "image/webp"], {
            error: "Only JPG, PNG, and WebP images are allowed.",
          })
          .max(1024 * 1024 * 5, "Image size must be less than 5MB.")
      )
    )
    .min(1, "At least one image is required."),
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
  closedDates: z.array(z.coerce.date()).optional(),
  holidayDates: z.array(z.coerce.date()).optional(),

  publicHolidaySupplementPercent: z.coerce.number(),
  weekendSupplementPercent: z.coerce.number(),
  availability: availabilitySchema,
  cancellationTerms: z
    .array(z.string())
    .min(1, "At least one cancellation term is required."),
  realease: z.string().min(1, "Realease is required."),
  isB2B: z.coerce.boolean(),
  isB2C: z.coerce.boolean(),
  overridePriceFromContract: z.coerce.boolean(),
  isBookingPerProduct: z.coerce.boolean(),
});

export type ProductType = z.infer<typeof productZodSchema>;
