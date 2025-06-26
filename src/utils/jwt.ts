import jwt from "jsonwebtoken";
import {
  JWT_EXP_IN,
  JWT_REFRESH_EXP_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from "../config/env";
import ms from "ms";

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXP_IN! as ms.StringValue });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: JWT_REFRESH_EXP_IN! as ms.StringValue,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET!);
};
