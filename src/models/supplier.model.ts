import mongoose, { InferSchemaType } from "mongoose";

const TITLE_ENUM = ["Mr", "Mrs", "Ms", "Dr"] as const;

const AVAILABILITY_TIME_ENUM = [
  "Full Day",
  "Weekend only (Including Sunday)",
  "Morning Hours",
  "Afternoon Hours",
  "Evening Hours",
] as const;

const SERVICE_TYPE_ENUM = [
  "Guide",
  "Assistant",
  "Driver-Guide",
  "Interpreter",
  "Tour Escort",
] as const;

const GUIDING_LEVEL_ENUM = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

const LANGUAGE_LEVEL_ENUM = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
] as const;

const CANCELLATION_AMENDMENT_UNIT_ENUM = ["Hours", "Days"] as const;
const AMENDMENT_RATE_TYPE_ENUM = ["Fixed", "Percent"] as const;

export const STANDARD_RATE_TIER_HOURS = [
  0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
] as const;

const phoneSchema = new mongoose.Schema(
  {
    code: { type: String },
    number: { type: String },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    streetAndNumber: { type: String, required: true },
    city: { type: String, required: true },
    municipality: String,
    district: String,
    state: String,
    country: { type: String, required: true, default: "Germany" },
    postalCode: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const guidingLocationEntrySchema = new mongoose.Schema(
  {
    location: { type: String, required: true, trim: true },
    guidingLevel: { type: String, enum: GUIDING_LEVEL_ENUM },
    attraction: { type: String, trim: true },
  },
  { _id: false }
);

const guidingLanguageEntrySchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    languageLevel: { type: String, enum: LANGUAGE_LEVEL_ENUM },
  },
  { _id: false }
);

const rateTierSchema = new mongoose.Schema(
  {
    hours: { type: Number, required: true },
    rate: { type: Number, min: 0 },
  },
  { _id: false }
);

const cancellationTermSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: CANCELLATION_AMENDMENT_UNIT_ENUM,
      required: true,
    },
    value: { type: Number, min: 0, required: true },
    percentage: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const amendmentSchema = new mongoose.Schema(
  {
    durationType: {
      type: String,
      enum: CANCELLATION_AMENDMENT_UNIT_ENUM,
      required: true,
    },
    value: { type: Number, min: 0, required: true },
    rateType: {
      type: String,
      enum: AMENDMENT_RATE_TYPE_ENUM,
      required: true,
    },
    rateValue: { type: Number, min: 0 },
    weekendsIncluded: { type: Boolean, default: false },
    publicHolidayIncluded: { type: Boolean, default: false },
  },
  { _id: false }
);

const locationSupplementEntrySchema = new mongoose.Schema(
  {
    guidingLocation: { type: String, required: true, trim: true },
    locationSupplement: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const languageSupplementEntrySchema = new mongoose.Schema(
  {
    guidingLanguage: { type: String, required: true, trim: true },
    languageSupplement: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    personalInfo: {
      title: { type: String, enum: TITLE_ENUM },
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      familyStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
      },
      birthPlace: { type: String, required: true },
      remunerationExpectation: { type: Number, min: 0 },
      availabilityTime: {
        type: [String],
        enum: AVAILABILITY_TIME_ENUM,
        default: [],
      },
      howDidYouHearAboutUs: {
        type: String,
        enum: [
          "Social Media",
          "Website",
          "Referral",
          "Advertisement",
          "Other",
        ],
      },
      typeOfServicesProvided: {
        type: [String],
        enum: SERVICE_TYPE_ENUM,
        default: [],
      },
      transportationDetail: String,
      hobbies: [String],
      memberOfAssociation: {
        type: String,
        enum: ["Yes", "No", "Applied"],
      },
      associationName: String,
    },

    addresses: { type: [addressSchema], default: [] },

    contact: {
      preferredFormOfContact: {
        type: String,
        enum: ["Email", "Phone", "WhatsApp", "SMS"],
        default: "Email",
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      alternateEmail: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      mobile: {
        code: String,
        number: { type: String, required: true },
      },
      officePhone: phoneSchema,
      homePhone: phoneSchema,
      otherPhone: phoneSchema,
      fax: phoneSchema,
      whatsapp: phoneSchema,
      skype: String,
      website: String,
      socialMedia: {
        facebook: String,
        linkedin: String,
        instagram: String,
        twitter: String,
        tiktok: String,
      },
      tripAdvisor: String,
      profileVideo: String,
      otherProfile: String,
      sampleTourVideo: String,
      review: String,
    },

    experience: {
      shortDescription: { type: String, maxlength: 1000 },
      aboutYourself: { type: String, maxlength: 1000 },
      references: { type: String, maxlength: 500 },
      yearsOfExperience: { type: Number, min: 0 },
      nonFormalEducation: String,
      formalEducation: String,
      professionalCourses: [String],
      tourType: {
        type: String,
        enum: [
          "Walking Tours",
          "Bus Tours",
          "Bike Tours",
          "Boat Tours",
          "Adventure Tours",
          "Cultural Tours",
        ],
      },
      tourTopic: {
        type: String,
        enum: [
          "Historical",
          "Cultural",
          "Adventure",
          "Food & Wine",
          "Art & Architecture",
          "Nature",
        ],
      },
      guidingLocation: { type: [guidingLocationEntrySchema], default: [] },
      guidingLanguages: { type: [guidingLanguageEntrySchema], default: [] },
    },

    billing: {
      bic: String,
      taxNo: String,
      vatNo: String,
      vat: String,
      bankAccountHolder: String,
      iban: String,
      currency: { type: String, default: "EUR" },
      otherPaymentOptions: String,
      vatType: {
        type: String,
        enum: [
          "I hereby confirm my status as a freelance, self employed tour guide with respect to income tax and social security",
          "I am a small business owner and thus V.A.T. exempt according to European law",
          "Taxable not in Country of Origin, Reverse Charge",
        ],
      },
    },

    contract: {
      contractStartDate: { type: Date, default: Date.now },
      contractEndDate: Date,
      serviceType: {
        type: String,
        enum: SERVICE_TYPE_ENUM,
        required: true,
      },
      rateTiers: { type: [rateTierSchema], default: [] },
    },

    cancellationTerms: { type: [cancellationTermSchema], default: [] },

    amendments: { type: [amendmentSchema], default: [] },

    locationSupplements: {
      type: [locationSupplementEntrySchema],
      default: [],
    },

    languageSupplements: {
      type: [languageSupplementEntrySchema],
      default: [],
    },

    docs: {
      identificationNumber: String,
      photoUpload: String,
      cvUpload: String,
      licenced: { type: Boolean, default: false },
      insured: { type: Boolean, default: false },
      criminalRecord: { type: Boolean, default: false },
      contracted: { type: Boolean, default: false },
      whisperSystem: { type: Boolean, default: false },
      vatAmount: { type: Boolean, default: false },
      commission: { type: Boolean, default: false },
    },

    serviceConfig: {
      extraHour: Number,
      workingDays: [String],
      workingMonths: [String],
      workingHoursStartTime: String,
      workingHoursEndTime: String,
      supplementNeeded: Boolean,
      meetingPointNotCentralSupplement: Number,
      publicTransportSupplementRateInEUR: Number,
      paymentAgreement: {
        type: String,
        enum: ["Pre-Service", "Post-Service"],
      },
      callOffTimeInDaysBeforeService: Number,
      maxPax: { type: Number, min: 0 },
      alsoFax: Boolean,
    },

    rating: {
      averageRating: { type: Number, min: 0, max: 5, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    comments: String,
    autoBookings: { type: Boolean, default: false },
    employee: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Suspended"],
      default: "Pending",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "guides",
  }
);

supplierSchema.index({
  "personalInfo.firstName": 1,
  "personalInfo.lastName": 1,
});
supplierSchema.index({ "contact.email": 1 }, { unique: true });
supplierSchema.index({ status: 1 });
supplierSchema.index({ "experience.guidingLocation.location": 1 });
supplierSchema.index({ "experience.guidingLanguages.language": 1 });
supplierSchema.index({ createdAt: -1 });

export type SupplierDocument = InferSchemaType<typeof supplierSchema>;

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
