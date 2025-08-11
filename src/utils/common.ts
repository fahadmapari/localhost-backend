import bcrypt from "bcrypt";
import crypto from "crypto";

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

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// TODO: update later
export function generateETag(productData: any) {
  return crypto
    .createHash("md5")
    .update(JSON.stringify(productData))
    .digest("hex");
}
