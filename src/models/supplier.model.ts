import mongoose, { InferSchemaType } from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    code: { type: String },
    number: { type: String },
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    personalInfo: {
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
        type: String,
        enum: ["Full Time", "Part Time", "Weekends Only", "Flexible"],
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
        type: String,
        enum: [
          "City Tours",
          "Museum Tours",
          "Adventure Tours",
          "Cultural Tours",
          "Multiple",
        ],
      },
      hobbies: [String],
      memberOfAssociation: {
        type: String,
        enum: ["Yes", "No", "Applied"],
      },
      associationName: String,
    },

    address: {
      streetAndNumber: { type: String, required: true },
      city: { type: String, required: true },
      municipality: String,
      district: String,
      state: String,
      country: { type: String, required: true, default: "Germany" },
      postalCode: { type: String, required: true },
      isPrimary: { type: Boolean, default: false },
    },

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
      whatsapp: String,
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
      guidingLocation: [String],
      guidingLanguages: [String],
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
        enum: ["Guide", "Assistant"],
        required: true,
      },
    },

    cancellationTerms: {
      hours: { percentage: Number, days: Number },
      days1: { percentage: Number, days: Number },
      days2: { percentage: Number, days: Number },
    },

    locationSupplement: {
      currentLocation: String,
      locationSupplement: [String],
    },

    languageSupplement: {
      currentLanguage: String,
      languageSupplement: [String],
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
      alsoFax: Boolean,
    },

    amendments: {
      canBeAddedByClicking: Boolean,
      buttonFill: Boolean,
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
supplierSchema.index({ "experience.guidingLocation": 1 });
supplierSchema.index({ "experience.guidingLanguages": 1 });
supplierSchema.index({ createdAt: -1 });

export type SupplierDocument = InferSchemaType<typeof supplierSchema>;

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
