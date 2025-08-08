import { clientSchema } from "../schema/client.schema";
import { z } from "zod";
import { hashPassword } from "../utils/common";
import { ClientProfile } from "../models/profile.model";
import User from "../models/user.model";

export const getClientListService = async (page: number, limit: number) => {
  try {
    const clients = await ClientProfile.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate("userId")
      .lean();
    return clients;
  } catch (error) {
    throw error;
  }
};

export const registerClientService = async (
  data: z.infer<typeof clientSchema>
) => {
  try {
    const hashedPassword = await hashPassword(data.password);

    const newUser = await User.create({
      name: data.firstName + " " + data.lastName,
      email: data.email,
      password: hashedPassword,
      role: "client",
    });

    const newClient = await ClientProfile.create({
      userId: newUser._id,
      firstName: data.firstName,
      lastName: data.lastName,
      status: true,
      email: data.email,
      boardedFromOnlinePortal: false,
      mobile: {
        code: data.mobile.code,
        number: data.mobile.number,
      },
      whatsapp: {
        code: data.whatsapp.code,
        number: data.whatsapp.number,
      },
      teamsId: data.teamsId,
      position: data.position,
      companyInformation: {
        name: data.companyName,
        address: data.companyAddress,
        zipCode: data.companyZipCode,
        country: data.companyCountry,
        city: data.companyCity,
        preferredPaymentMethod: data.companyPreferredPaymentMethod,
        telephone: {
          code: data.companyTelephoneCode,
          number: data.companyTelephone,
        },
        fax: {
          code: data.companyFaxCode,
          number: data.companyFax,
        },
        website: data.companyWebsite,
        email: data.companyEmail,
        associationName: data.companyAssociationName,
        VATNumber: data.companyVATNumber,
        preferredLanguage: data.companyPreferredPaymentMethod,
        currency: data.companyCurrency,
        paymentAgreement: data.companyPaymentAgreement,
      },
    });

    return newClient;
  } catch (error) {
    throw error;
  }
};
