import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import { userSchema } from "@/schema/user.schema";
import { hashPassword } from "@/utils/common";
import { createError } from "@/utils/errorHandlers";
import type { User } from "@/db/schema";

export const changeAdminPasswordService = async (userId: string, newPassword: string) => {
  const foundUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!foundUser) throw createError("User not found", 404);

  const hashedPassword = await hashPassword(newPassword);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
};

export const createNewAdminService = async (values: z.infer<typeof userSchema>) => {
  const hashedPassword = await hashPassword(values.password);

  const [newAdmin] = await db
    .insert(users)
    .values({
      name: values.name,
      email: values.email,
      password: hashedPassword,
      role: values.role as User["role"],
    })
    .returning();

  return newAdmin;
};

export const getAllAdminsService = async () => {
  return db
    .select()
    .from(users)
    .where(inArray(users.role, ["super admin", "admin"]))
    .orderBy(desc(users.createdAt));
};
