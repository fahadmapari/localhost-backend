const mongoose = require("mongoose");

// Guide Schema for TravMonde Application
const supplierSchema = new mongoose.Schema(
  {
    // Personal Information
    personalInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
      dateOfBirth: {
        type: Date,
        required: true,
      },
      nationality: {
        type: String,
        required: true,
      },
      familyStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
      },
      birthPlace: {
        type: String,
        required: true,
      },
      remunerationExpectation: {
        type: Number, // EUR per hour
        min: 0,
      },
      availabilityTime: {
        type: String,
        enum: ["Full Time", "Part Time", "Weekends Only", "Flexible"],
      },
      howDidYouHearAboutUs: {
        type: String,
        enum: ["Social Media", "Website", "Referral", "Advertisement", "Other"],
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

    // Guide Address
    address: {
      streetAndNumber: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      municipality: String,
      district: String,
      state: String,
      country: {
        type: String,
        required: true,
        default: "Germany", // Based on the interface
      },
      postalCode: {
        type: String,
        required: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
    },

    // Communication Information
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
        number: {
          type: String,
          required: true,
        },
      },
      officePhone: {
        code: String,
        number: String,
      },
      homePhone: {
        code: String,
        number: String,
      },
      otherPhone: {
        code: String,
        number: String,
      },
      fax: {
        code: String,
        number: String,
      },
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
      profileVideo: String, // URL
      otherProfile: String, // URL
      sampleTourVideo: String, // URL
      review: String, // URL
    },

    // Experience
    experience: {
      shortDescription: {
        type: String,
        maxlength: 1000,
      },
      aboutYourself: {
        type: String,
        maxlength: 1000,
      },
      references: {
        type: String,
        maxlength: 500,
      },
      yearsOfExperience: {
        type: Number,
        min: 0,
      },
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
      guidingLocation: [String], // Array of locations
      guidingLanguages: [String], // Array of languages
    },

    // Billing Information
    billing: {
      bic: String,
      taxNo: String,
      vatNo: String,
      vat: String,
      bankAccountHolder: String,
      iban: String,
      currency: {
        type: String,
        default: "EUR",
      },
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

    // Contract Information
    contract: {
      contractStartDate: {
        type: Date,
        default: Date.now,
      },
      contractEndDate: Date,
      serviceType: {
        type: String,
        enum: ["Guide", "Assistant"],
        required: true,
      },
    },

    // Cancellation Terms
    cancellationTerms: {
      hours: {
        percentage: Number,
        days: Number,
      },
      days1: {
        percentage: Number,
        days: Number,
      },
      days2: {
        percentage: Number,
        days: Number,
      },
    },

    // Supplements
    locationSupplement: {
      currentLocation: String,
      locationSupplement: [String],
    },

    languageSupplement: {
      currentLanguage: String,
      languageSupplement: [String],
    },

    // Documents
    docs: {
      identificationNumber: String,
      photoUpload: String, // File path or URL
      cvUpload: String, // File path or URL
      licenced: {
        type: Boolean,
        default: false,
      },
      insured: {
        type: Boolean,
        default: false,
      },
      criminalRecord: {
        type: Boolean,
        default: false,
      },
      contracted: {
        type: Boolean,
        default: false,
      },
      whisperSystem: {
        type: Boolean,
        default: false,
      },
      vatAmount: {
        type: Boolean,
        default: false,
      },
      commission: {
        type: Boolean,
        default: false,
      },
    },

    // Service Configuration
    serviceConfig: {
      extraHour: Number,
      workingDays: [String], // Array of days
      workingMonths: [String], // Array of months
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

    // Amendments
    amendments: {
      canBeAddedByClicking: Boolean,
      buttonFill: Boolean,
    },

    // Rating Information
    rating: {
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // System Fields
    comments: String,
    autoBookings: {
      type: Boolean,
      default: false,
    },
    employee: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Suspended"],
      default: "Pending",
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "guides",
  }
);

// Indexes for better query performance
supplierSchema.index({
  "personalInfo.firstName": 1,
  "personalInfo.lastName": 1,
});
supplierSchema.index({ "contact.email": 1 }, { unique: true });
supplierSchema.index({ status: 1 });
supplierSchema.index({ "experience.guidingLocation": 1 });
supplierSchema.index({ "experience.guidingLanguages": 1 });
supplierSchema.index({ createdAt: -1 });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
