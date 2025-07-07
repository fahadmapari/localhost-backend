import { z } from "zod";

const meetingPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  text: z.string(),
  pickupInstructions: z.array(z.string()).optional(),
});

const endPointSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  text: z.string().optional(),
});

const availabilitySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.object({
    value: z.number(),
    unit: z.enum(["minutes", "hours", "days"]).default("hours"),
  }),
});

export const productZodSchema = z.object({
  title: z.string(),
  serviceType: z.enum(["guide", "assistant"]).default("guide"),
  tourType: z.enum(["shared", "private"]).default("private"),
  activityType: z.enum(["city tours"]).default("city tours"),
  subType: z.enum(["walking tours"]).default("walking tours"),
  description: z.string(),
  willSee: z.array(z.string()),
  willLearn: z.array(z.string()),
  tourTextLanguage: z.enum(["english", "spanish"]).default("english"),
  bookingType: z.enum(["instant", "request"]).default("instant"),
  tourGuideLanguage: z.enum(["english", "spanish"]).default("english"),
  mandatoryInformation: z.array(z.string()),
  recommdendedInformation: z.array(z.string()),
  included: z.array(z.string()),
  excluded: z.array(z.string()).optional(),
  activitySuitableFor: z.enum(["all", "adults", "children"]).default("all"),
  voucherType: z
    .enum(["printed or e-voucher accepted", "printed", "e-voucher accepted"])
    .default("printed or e-voucher accepted"),
  maxPax: z.number(),
  meetingPoint: meetingPointSchema,
  endPoint: endPointSchema.optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()),
  priceModel: z.enum(["fixed"]).default("fixed"),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]).default("EUR"),
  b2bRate: z.number(),
  b2bExtraHourSupplement: z.number().default(0),
  b2cRate: z.number().optional(),
  b2cExtraHourSupplement: z.number().optional(),
  closedDates: z.array(z.coerce.date()).optional(),
  holidayDates: z.array(z.coerce.date()).optional(),
  publicHolidaySupplementPercent: z.number().optional(),
  weekendSupplementPercent: z.number().optional(),
  availability: availabilitySchema.optional(),
  cancellationTerms: z.array(z.string()),
  realease: z.string().optional(),
  isB2B: z.boolean().default(true),
  isB2C: z.boolean().default(false),
  overridePriceFromContract: z.boolean().default(true),
  isBookingPerProduct: z.boolean().default(false),
});

export type ProductType = z.infer<typeof productZodSchema>;
