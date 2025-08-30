import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  JWT_EXP_IN,
  JWT_REFRESH_EXP_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from "../config/env";
import ms from "ms";

// to make key.key to key { key: key }
export function parseNestedObject<T = any>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split(".");
      let current: Record<string, any> = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, any>;
      }

      current[keys[keys.length - 1]] = obj[key];
    }
  }

  return result as T;
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateRefreshToken(
  userId: string,
  role: string,
  jti: string
) {
  return jwt.sign(
    {
      userId,
      role,
      jti,
    },
    JWT_REFRESH_SECRET!,
    {
      expiresIn: JWT_REFRESH_EXP_IN as ms.StringValue,
    }
  );
}

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    JWT_SECRET!,
    {
      expiresIn: JWT_EXP_IN as ms.StringValue,
    }
  );
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, JWT_SECRET!);
};

export const verifyRefreshToken = async (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET!);
};

// TODO: update later
export function generateETag(productData: any) {
  return crypto
    .createHash("md5")
    .update(JSON.stringify(productData))
    .digest("hex");
}
