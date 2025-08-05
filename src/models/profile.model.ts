import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    discriminatorKey: "profileType",
    collection: "profiles",
    timestamps: true,
  }
);

const clientCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  PreferredPaymentMethod: {
    type: String,
    enum: ["Bank transfer", "Net banking", "Credit card"],
  },
  telephone: {
    code: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },

  fax: {
    code: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },

  VATNumber: {
    type: String,
  },

  website: {
    type: String,
  },

  email: {
    type: String,
  },
  preferredLanguage: {
    type: String,
  },
  currency: {
    type: String,
    enum: ["EUR", "USD", "INR"],
  },
  associationName: {
    type: String,
  },
  paymentAgreement: {
    type: String,
    enum: ["Pre-Service", "Post-Service"],
    required: true,
  },
});

const clientProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  mobile: {
    code: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },

  whatsapp: {
    code: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },

  teamsId: {
    type: String,
    required: true,
  },

  position: {
    type: String,
  },
  companyInformation: clientCompanySchema,
});

export const Profile = mongoose.model("Profile", profileSchema);

export const ClientProfile = Profile.discriminator(
  "client",
  clientProfileSchema
);
