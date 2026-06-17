import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createError } from "@/utils/errorHandlers";
import type { User } from "@/db/schema";

export const getAllRegisteredUsers = async (): Promise<User[]> => {
  return db.select().from(users);
};

export const getUserById = async (id: string): Promise<User> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw createError("User not found", 404);
  return user;
};
