import { z } from "zod";

const phoneSchema = z.object({
  code: z.string().optional(),
  number: z.string().optional(),
});

const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.coerce.date(),
  nationality: z.string().min(1, "Nationality is required"),
  familyStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  birthPlace: z.string().min(1, "Birth place is required"),
  remunerationExpectation: z.coerce.number().min(0).optional(),
  availabilityTime: z
    .enum(["Full Time", "Part Time", "Weekends Only", "Flexible"])
    .optional(),
  howDidYouHearAboutUs: z
    .enum(["Social Media", "Website", "Referral", "Advertisement", "Other"])
    .optional(),
  typeOfServicesProvided: z
    .enum([
      "City Tours",
      "Museum Tours",
      "Adventure Tours",
      "Cultural Tours",
      "Multiple",
    ])
    .optional(),
  hobbies: z.array(z.string()).optional(),
  memberOfAssociation: z.enum(["Yes", "No", "Applied"]).optional(),
  associationName: z.string().optional(),
});

const addressSchema = z.object({
  streetAndNumber: z.string().min(1, "Street and number is required"),
  city: z.string().min(1, "City is required"),
  municipality: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  isPrimary: z.boolean().optional(),
});

const contactSchema = z.object({
  preferredFormOfContact: z.enum(["Email", "Phone", "WhatsApp", "SMS"]),
  email: z.string().email("Please enter a valid email").toLowerCase(),
  alternateEmail: z
    .string()
    .email("Please enter a valid email")
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  mobile: z.object({
    code: z.string().optional(),
    number: z.string().min(1, "Mobile number is required"),
  }),
  officePhone: phoneSchema.optional(),
  homePhone: phoneSchema.optional(),
  otherPhone: phoneSchema.optional(),
  fax: phoneSchema.optional(),
  whatsapp: z.string().optional(),
  skype: z.string().optional(),
  website: z.string().optional(),
  socialMedia: z
    .object({
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  tripAdvisor: z.string().optional(),
  profileVideo: z.string().optional(),
  otherProfile: z.string().optional(),
  sampleTourVideo: z.string().optional(),
  review: z.string().optional(),
});

const experienceSchema = z.object({
  shortDescription: z.string().max(1000).optional(),
  aboutYourself: z.string().max(1000).optional(),
  references: z.string().max(500).optional(),
  yearsOfExperience: z.coerce.number().min(0).optional(),
  nonFormalEducation: z.string().optional(),
  formalEducation: z.string().optional(),
  professionalCourses: z.array(z.string()).optional(),
  tourType: z
    .enum([
      "Walking Tours",
      "Bus Tours",
      "Bike Tours",
      "Boat Tours",
      "Adventure Tours",
      "Cultural Tours",
    ])
    .optional(),
  tourTopic: z
    .enum([
      "Historical",
      "Cultural",
      "Adventure",
      "Food & Wine",
      "Art & Architecture",
      "Nature",
    ])
    .optional(),
  guidingLocation: z.array(z.string()).optional(),
  guidingLanguages: z.array(z.string()).optional(),
});

const billingSchema = z.object({
  bic: z.string().optional(),
  taxNo: z.string().optional(),
  vatNo: z.string().optional(),
  vat: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  iban: z.string().optional(),
  currency: z.enum(["EUR", "USD", "INR"]).default("EUR"),
  otherPaymentOptions: z.string().optional(),
  vatType: z
    .enum([
      "I hereby confirm my status as a freelance, self employed tour guide with respect to income tax and social security",
      "I am a small business owner and thus V.A.T. exempt according to European law",
      "Taxable not in Country of Origin, Reverse Charge",
    ])
    .optional(),
});

const contractSchema = z.object({
  contractStartDate: z.coerce.date(),
  contractEndDate: z.coerce.date().optional(),
  serviceType: z.enum(["Guide", "Assistant"]),
});

const cancellationTermsSchema = z
  .object({
    hours: z
      .object({
        percentage: z.coerce.number().optional(),
        days: z.coerce.number().optional(),
      })
      .optional(),
    days1: z
      .object({
        percentage: z.coerce.number().optional(),
        days: z.coerce.number().optional(),
      })
      .optional(),
    days2: z
      .object({
        percentage: z.coerce.number().optional(),
        days: z.coerce.number().optional(),
      })
      .optional(),
  })
  .optional();

const locationSupplementSchema = z
  .object({
    currentLocation: z.string().optional(),
    locationSupplement: z.array(z.string()).optional(),
  })
  .optional();

const languageSupplementSchema = z
  .object({
    currentLanguage: z.string().optional(),
    languageSupplement: z.array(z.string()).optional(),
  })
  .optional();

const docsSchema = z
  .object({
    identificationNumber: z.string().optional(),
    photoUpload: z.string().optional(),
    cvUpload: z.string().optional(),
    licenced: z.boolean().optional(),
    insured: z.boolean().optional(),
    criminalRecord: z.boolean().optional(),
    contracted: z.boolean().optional(),
    whisperSystem: z.boolean().optional(),
    vatAmount: z.boolean().optional(),
    commission: z.boolean().optional(),
  })
  .optional();

const serviceConfigSchema = z
  .object({
    extraHour: z.coerce.number().optional(),
    workingDays: z.array(z.string()).optional(),
    workingMonths: z.array(z.string()).optional(),
    workingHoursStartTime: z.string().optional(),
    workingHoursEndTime: z.string().optional(),
    supplementNeeded: z.boolean().optional(),
    meetingPointNotCentralSupplement: z.coerce.number().optional(),
    publicTransportSupplementRateInEUR: z.coerce.number().optional(),
    paymentAgreement: z.enum(["Pre-Service", "Post-Service"]).optional(),
    callOffTimeInDaysBeforeService: z.coerce.number().optional(),
    alsoFax: z.boolean().optional(),
  })
  .optional();

const amendmentsSchema = z
  .object({
    canBeAddedByClicking: z.boolean().optional(),
    buttonFill: z.boolean().optional(),
  })
  .optional();

export const supplierCreateSchema = z.object({
  personalInfo: personalInfoSchema,
  address: addressSchema,
  contact: contactSchema,
  experience: experienceSchema.optional(),
  billing: billingSchema.optional(),
  contract: contractSchema,
  cancellationTerms: cancellationTermsSchema,
  locationSupplement: locationSupplementSchema,
  languageSupplement: languageSupplementSchema,
  docs: docsSchema,
  serviceConfig: serviceConfigSchema,
  amendments: amendmentsSchema,
  comments: z.string().optional(),
  autoBookings: z.boolean().optional(),
  employee: z.boolean().optional(),
  status: z
    .enum(["Active", "Inactive", "Pending", "Suspended"])
    .default("Pending"),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
