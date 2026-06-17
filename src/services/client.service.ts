import { db } from "@/db";
import { users, clientProfiles } from "@/db/schema";
import { eq, sql, desc, gte } from "drizzle-orm";
import { z } from "zod";
import { clientSchema } from "@/schema/client.schema";
import { hashPassword } from "@/utils/common";
import dayjs from "dayjs";

export const getAllClientsService = async () => {
  return db.query.clientProfiles.findMany({ with: { user: true } });
};

export const getClientMetricsService = async () => {
  const [[{ totalClients }], [{ totalActiveClients }], [{ totalBoardedClients }]] =
    await Promise.all([
      db.select({ totalClients: sql<number>`count(*)::int` }).from(clientProfiles),
      db
        .select({ totalActiveClients: sql<number>`count(*)::int` })
        .from(clientProfiles)
        .where(eq(clientProfiles.status, true)),
      db
        .select({ totalBoardedClients: sql<number>`count(*)::int` })
        .from(clientProfiles)
        .where(eq(clientProfiles.boardedFromOnlinePortal, true)),
    ]);

  const oneYearAgo = dayjs().subtract(1, "year").toDate();

  const clientsOnboardLast12Months = await db
    .select({ createdAt: clientProfiles.createdAt })
    .from(clientProfiles)
    .where(gte(clientProfiles.createdAt, oneYearAgo))
    .orderBy(desc(clientProfiles.createdAt));

  return { totalClients, totalActiveClients, totalBoardedClients, clientsOnboardLast12Months };
};

export const getClientListService = async (page: number, limit: number) => {
  return db.query.clientProfiles.findMany({
    with: { user: true },
    orderBy: [desc(clientProfiles.createdAt)],
    limit,
    offset: page * limit,
  });
};

export const registerClientService = async (data: z.infer<typeof clientSchema>) => {
  return db.transaction(async (tx) => {
    const hashedPassword = await hashPassword(data.password);

    const [newUser] = await tx
      .insert(users)
      .values({
        name: data.firstName + " " + data.lastName,
        email: data.email,
        password: hashedPassword,
        role: "client",
      })
      .returning();

    const [newClient] = await tx
      .insert(clientProfiles)
      .values({
        userId: newUser.id,
        firstName: data.firstName,
        lastName: data.lastName,
        status: true,
        email: data.email,
        boardedFromOnlinePortal: false,
        mobile: { code: data.mobile.code, number: data.mobile.number },
        whatsapp: { code: data.whatsapp.code, number: data.whatsapp.number },
        teamsId: data.teamsId,
        position: data.position,
        companyInformation: {
          name: data.companyName,
          address: data.companyAddress,
          zipCode: data.companyZipCode,
          country: data.companyCountry,
          city: data.companyCity,
          preferredPaymentMethod: data.companyPreferredPaymentMethod,
          telephone: { code: data.companyTelephoneCode, number: data.companyTelephone },
          fax: { code: data.companyFaxCode, number: data.companyFax },
          website: data.companyWebsite,
          email: data.companyEmail,
          associationName: data.companyAssociationName,
          VATNumber: data.companyVATNumber,
          preferredLanguage: data.companyPreferredPaymentMethod,
          currency: data.companyCurrency,
          paymentAgreement: data.companyPaymentAgreement,
        },
      })
      .returning();

    return newClient;
  });
};
