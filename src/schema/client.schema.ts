import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.email("Email is invalid."),
  mobile: z.object({
    code: z.string().min(1, "Mobile code is required."),
    number: z.number().min(1, "Mobile number is required."),
  }),
  whatsapp: z.object({
    code: z.string().min(1, "Whatsapp code is required."),
    number: z.number().min(1, "Whatsapp number is required."),
  }),
  teamsId: z.string().min(1, "Teams ID is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),

  position: z.string().min(1, "Position is required."),

  companyName: z.string().min(1, "Company name is required."),
  companyAddress: z.string().min(1, "Company address is required."),
  companyZipCode: z.number("Company zip code is required."),
  companyCountry: z.string().min(1, "Company country is required."),
  companyCity: z.string().min(1, "Company city is required."),
  companyPreferredPaymentMethod: z.enum([
    "Bank transfer",
    "Net banking",
    "Credit card",
  ]),
  companyVATNumber: z.string().min(1, "Company VAT number is required."),
  companyPaymentAgreement: z.enum(["Pre-Service", "Post-Service"]),
  companyTelephone: z.number().min(1, "Company telephone number is required."),
  companyTelephoneCode: z
    .string()
    .min(1, "Company telephone code is required."),
  companyFax: z.number().optional(),
  companyFaxCode: z.string().optional(),
  companyWebsite: z.url().optional(),
  companyEmail: z.email().optional(),
  companyAssociationName: z.string().optional(),
  companyCurrency: z.enum(["EUR", "USD", "INR"]).optional(),
});
