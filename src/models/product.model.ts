import mongoose, { InferSchemaType } from "mongoose";

const meetingPointSchema = new mongoose.Schema({
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
      enum: ["english", "spanish"],
      default: "english",
    },
    bookingType: {
      type: String,
      required: true,
      enum: ["instant", "request"],
      default: "instant",
    },
    tourGuideLanguage: {
      type: String,
      required: true,
      enum: ["english", "spanish"],
      default: "english",
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
    },

    images: {
      type: [String],
      required: true,
    },

    priceModel: {
      type: String,
      required: true,
      enum: ["fixed"],
      default: "fixed",
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "INR"],
      default: "EUR",
    },
    b2bRate: {
      type: Number,
      required: true,
    },
    b2bExtraHourSupplement: {
      type: Number,
      required: true,
      default: 0,
    },
    b2cRate: {
      type: Number,
    },
    b2cExtraHourSupplement: {
      type: Number,
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
