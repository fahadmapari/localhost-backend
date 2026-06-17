import { z } from "zod";

const TITLE_VALUES = ["Mr", "Mrs", "Ms", "Dr"] as const;
const AVAILABILITY_TIME_VALUES = [
  "Full Day",
  "Weekend only (Including Sunday)",
  "Morning Hours",
  "Afternoon Hours",
  "Evening Hours",
] as const;
const SERVICE_TYPE_VALUES = [
  "Guide",
  "Assistant",
  "Driver-Guide",
  "Interpreter",
  "Tour Escort",
] as const;
const GUIDING_LEVEL_VALUES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;
const LANGUAGE_LEVEL_VALUES = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
] as const;
const UNIT_VALUES = ["Hours", "Days"] as const;
const RATE_TYPE_VALUES = ["Fixed", "Percent"] as const;

const phoneSchema = z.object({
  code: z.string().optional(),
  number: z.string().optional(),
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

const guidingLocationEntrySchema = z.object({
  location: z.string().min(1, "Location is required"),
  guidingLevel: z.enum(GUIDING_LEVEL_VALUES).optional(),
  attraction: z.string().optional(),
});

const guidingLanguageEntrySchema = z.object({
  language: z.string().min(1, "Language is required"),
  languageLevel: z.enum(LANGUAGE_LEVEL_VALUES).optional(),
});

const rateTierSchema = z.object({
  hours: z.coerce.number().min(0),
  rate: z.coerce.number().min(0).optional(),
});

const cancellationTermSchema = z.object({
  type: z.enum(UNIT_VALUES),
  value: z.coerce.number().min(0),
  percentage: z.coerce.number().min(0).max(100).optional(),
});

const amendmentSchema = z.object({
  durationType: z.enum(UNIT_VALUES),
  value: z.coerce.number().min(0),
  rateType: z.enum(RATE_TYPE_VALUES),
  rateValue: z.coerce.number().min(0).optional(),
  weekendsIncluded: z.boolean().optional(),
  publicHolidayIncluded: z.boolean().optional(),
});

const locationSupplementEntrySchema = z.object({
  guidingLocation: z.string().min(1, "Guiding location is required"),
  locationSupplement: z.coerce.number().min(0).optional(),
});

const languageSupplementEntrySchema = z.object({
  guidingLanguage: z.string().min(1, "Guiding language is required"),
  languageSupplement: z.coerce.number().min(0).optional(),
});

const personalInfoSchema = z.object({
  title: z.enum(TITLE_VALUES).optional(),
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
  availabilityTime: z.array(z.enum(AVAILABILITY_TIME_VALUES)).optional(),
  howDidYouHearAboutUs: z
    .enum(["Social Media", "Website", "Referral", "Advertisement", "Other"])
    .optional(),
  typeOfServicesProvided: z.array(z.enum(SERVICE_TYPE_VALUES)).optional(),
  transportationDetail: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  memberOfAssociation: z.enum(["Yes", "No", "Applied"]).optional(),
  associationName: z.string().optional(),
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
  whatsapp: phoneSchema.optional(),
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
  guidingLocation: z.array(guidingLocationEntrySchema).optional(),
  guidingLanguages: z.array(guidingLanguageEntrySchema).optional(),
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
  serviceType: z.enum(SERVICE_TYPE_VALUES),
  rateTiers: z.array(rateTierSchema).optional(),
});

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
    maxPax: z.coerce.number().min(0).optional(),
    alsoFax: z.boolean().optional(),
  })
  .optional();

export const supplierCreateSchema = z.object({
  personalInfo: personalInfoSchema,
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
  contact: contactSchema,
  experience: experienceSchema.optional(),
  billing: billingSchema.optional(),
  contract: contractSchema,
  cancellationTerms: z.array(cancellationTermSchema).optional(),
  amendments: z.array(amendmentSchema).optional(),
  locationSupplements: z.array(locationSupplementEntrySchema).optional(),
  languageSupplements: z.array(languageSupplementEntrySchema).optional(),
  docs: docsSchema,
  serviceConfig: serviceConfigSchema,
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
