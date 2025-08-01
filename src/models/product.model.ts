import mongoose, { InferSchemaType } from "mongoose";

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
    required: false,
    default: [],
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
  isAlwaysAvailable: {
    type: Boolean,
    required: true,
    default: false,
  },
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
    tourTextLanguage: {
      type: String,
      required: true,
      enum: ["english"],
      default: "english",
    },
    tourGuideLanguageInstant: {
      type: [String],
      required: false,
      default: [],
    },
    tourGuideLanguageOnRequest: {
      type: [String],
      required: true,
    },

    images: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

const productVariantSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
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
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bookingType: {
      type: String,
      required: true,
      enum: ["instant", "request"],
    },
    tourGuideLanguage: {
      type: String,
      required: true,
      default: [],
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
      required: false,
      default: [],
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
    closedDates: {
      type: [Date],
      required: false,
      default: [],
    },
    holidayDates: {
      type: [Date],
      required: false,
      default: [],
    },

    availability: availabilitySchema,

    cancellationTerms: {
      type: [String],
      required: true,
    },

    realease: {
      type: String,
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
      required: false,
      default: 0,
    },
    b2bRateOnRequest: {
      type: Number,
      required: true,
    },
    b2bExtraHourSupplementOnRequest: {
      type: Number,
      required: false,
      default: 0,
    },
    b2cRateInstant: {
      type: Number,
      required: true,
    },
    b2cExtraHourSupplementInstant: {
      type: Number,
      required: false,
      default: 0,
    },
    b2cRateOnRequest: {
      type: Number,
      required: true,
    },
    b2cExtraHourSupplementOnRequest: {
      type: Number,
      required: false,
      default: 0,
    },

    publicHolidaySupplementPercent: {
      type: Number,
      required: false,
    },
    weekendSupplementPercent: {
      type: Number,
      required: false,
    },

    isB2B: {
      type: Boolean,
      required: true,
      default: true,
    },

    isB2C: {
      type: Boolean,
      required: true,
      default: true,
    },

    overridePriceFromContract: {
      type: Boolean,
      required: true,
      default: false,
    },

    isBookingPerProduct: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductVariant = mongoose.model(
  "ProductVariant",
  productVariantSchema
);

export type ProductVariantDocument = InferSchemaType<
  typeof productVariantSchema
>;

export type ProductDocument = InferSchemaType<typeof productSchema>;

export default Product;
