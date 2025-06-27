import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development.local"}`,
});

export const {
  PORT,
  DB_URI,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXP_IN,
  ARCJET_KEY,
  REDIS_URL,
  REDIS_TOKEN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXP_IN,
} = process.env;
