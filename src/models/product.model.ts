import mongoose, { InferSchemaType } from "mongoose";
import { required } from "zod/v4/core/util.cjs";

const meetingPointSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  pickupInstructions: {
    type: [String],
  },
});

const endPointSchema = new mongoose.Schema({
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  text: {
    type: String,
  },
});

const availabilitySchema = new mongoose.Schema({
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  duration: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["minutes", "hours", "days"],
      default: "hours",
    },
  },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["guide", "assistant"],
      default: "guide",
    },
    tourType: {
      type: String,
      required: true,
      enum: ["shared", "private"],
      default: "private",
    },
    activityType: {
      type: String,
      required: true,
      enum: ["city tours"],
      default: "city tours",
    },
    subType: {
      type: String,
      required: true,
      enum: ["walking tours"],
      default: "walking tours",
    },
    description: {
      type: String,
      required: true,
    },
    willSee: {
      type: [String],
      required: true,
    },
    willLearn: {
      type: [String],
      required: true,
    },
    tourTextLanguage: {
      type: String,
      required: true,
      enum: ["english"],
      default: "english",
    },
    bookingType: {
      type: String,
      required: true,
      enum: ["instant", "request"],
      default: "instant",
    },
    tourGuideLanguageInstant: {
      type: [String],
    },
    tourGuideLanguageOnRequest: {
      type: [String],
      required: true,
    },
    mandatoryInformation: {
      type: [String],
      required: true,
    },
    recommdendedInformation: {
      type: [String],
      required: true,
    },
    included: {
      type: [String],
      required: true,
    },
    excluded: {
      type: [String],
    },
    activitySuitableFor: {
      type: String,
      enum: ["all", "adults", "children"],
      default: "all",
    },
    voucherType: {
      type: String,
      enum: ["printed or e-voucher accepted", "printed", "e-voucher accepted"],
      default: "printed or e-voucher accepted",
    },
    maxPax: {
      type: Number,
      required: true,
    },
    meetingPoint: meetingPointSchema,
    endPoint: endPointSchema,
    tags: {
      type: [String],
      enum: [
        "walk",
        "museum",
        "palace",
        "science",
        "technology",
        "beer",
        "christmas",
      ],
      required: true,
    },

    images: {
      type: [String],
      required: true,
    },

    priceModel: {
      type: String,
      required: true,
      enum: ["fixed rate", "per pax"],
      default: "fixed rate",
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "INR"],
      default: "EUR",
    },
    b2bRateInstant: {
      type: Number,
      required: true,
    },
    b2bExtraHourSupplementInsant: {
      type: Number,
      default: 0,
    },
    b2bRateOnRequest: {
      type: Number,
      required: true,
    },
    b2bExtraHourSupplementOnRequest: {
      type: Number,
      default: 0,
    },
    b2cRateInstant: {
      type: Number,
      required: true,
    },
    b2cExtraHourSupplementInstant: {
      type: Number,
      default: 0,
    },
    b2cRateOnRequest: {
      type: Number,
      required: true,
    },
    b2cExtraHourSupplementOnRequest: {
      type: Number,
      default: 0,
    },
    closedDates: {
      type: [Date],
    },
    holidayDates: {
      type: [Date],
    },
    publicHolidaySupplementPercent: {
      type: Number,
    },
    weekendSupplementPercent: {
      type: Number,
    },
    availability: availabilitySchema,

    cancellationTerms: {
      type: [String],
      required: true,
    },

    realease: {
      type: String,
    },

    isB2B: {
      type: Boolean,
      default: true,
    },

    isB2C: {
      type: Boolean,
      default: false,
    },

    overridePriceFromContract: {
      type: Boolean,
      default: true,
    },

    isBookingPerProduct: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export default Product;
