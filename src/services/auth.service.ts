import { db } from "@/db";
import { users } from "@/db/schema";
import { createError } from "@/utils/errorHandlers";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import redisClient from "@/config/redis";
import {
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  THIRTY_DAYS,
} from "@/config/env";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyRefreshToken,
  verifyToken,
} from "@/utils/common";
import type { User } from "@/db/schema";

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<{ accessToken: string; refreshToken: string; user: User }> => {
  return db.transaction(async (tx) => {
    const existing = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) throw createError("User already exists", 409);

    const hashedPassword = await hashPassword(password);

    const [newUser] = await tx
      .insert(users)
      .values({ name, email, password: hashedPassword, role: role as User["role"] })
      .returning();

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) throw createError("Server Error", 500);

    const accessToken = generateAccessToken(newUser.id, newUser.role);
    const jti = crypto.randomUUID();
    const refreshToken = generateRefreshToken(newUser.id, newUser.role, jti);

    await redisClient.set(
      `refresh:${jti}`,
      JSON.stringify({ userId: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email }),
      { EX: Number(THIRTY_DAYS), NX: true },
    );

    return { accessToken, refreshToken, user: newUser };
  });
};

export const siginInUser = async (
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { name: string; email: string; role: string; userId: string };
}> => {
  const foundUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!foundUser) throw createError("User not found", 404);

  const isPasswordCorrect = await comparePassword(password, foundUser.password);
  if (!isPasswordCorrect) throw createError("Incorrect password", 401);

  if (!JWT_SECRET || !JWT_REFRESH_SECRET) throw createError("Server Error", 500);

  const accessToken = generateAccessToken(foundUser.id, foundUser.role);
  const jti = crypto.randomUUID();
  const refreshToken = generateRefreshToken(foundUser.id, foundUser.role, jti);

  await redisClient.set(
    `refresh:${jti}`,
    JSON.stringify({ userId: foundUser.id, name: foundUser.name, role: foundUser.role, email: foundUser.email }),
    { EX: Number(THIRTY_DAYS), NX: true },
  );

  return {
    accessToken,
    refreshToken,
    user: { email: foundUser.email, name: foundUser.name, role: foundUser.role, userId: foundUser.id },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET!);
    const raw = await redisClient.get(`refresh:${decoded?.jti}`);
    const exists = raw
      ? (JSON.parse(raw) as { userId: string; name: string; role: string; email: string })
      : null;

    if (!exists || exists.userId !== decoded.userId) {
      throw createError("Invalid token", 401);
    }

    const accessToken = generateAccessToken(decoded.userId, decoded.role);
    return { accessToken, user: exists };
  } catch (error: any) {
    if (error?.message === "jwt expired" || error?.message === "invalid signature") {
      error.statusCode = 401;
    }
    throw error;
  }
};

export const verifyAccessToken = async (accessToken: string) => {
  try {
    const decoded: any = verifyToken(accessToken);
    return { userId: decoded.userId as string, role: decoded.role as string };
  } catch (error: any) {
    if (error.message === "jwt expired" || error.message === "invalid signature") {
      error.statusCode = 401;
    }
    throw error;
  }
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const decoded: any = verifyRefreshToken(refreshToken);
  await redisClient.del(`refresh:${decoded?.jti}`);
};
