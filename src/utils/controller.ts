import { Response } from "express";

type SendResponseOptions<T> = {
  statusCode?: number;
  message?: string;
  success?: boolean;
  data?: T;
};

export const sendResponse = <T>(
  response: Response,
  { statusCode = 200, message, success, data }: SendResponseOptions<T>
): void => {
  const resolvedSuccess = success ?? statusCode < 400;
  const resolvedMessage =
    message || (resolvedSuccess ? "Request successful" : "Request failed");

  if (statusCode === 204 || statusCode === 304) {
    response.status(statusCode).end();
    return;
  }

  const payload: { success: boolean; message: string; data?: T } = {
    success: resolvedSuccess,
    message: resolvedMessage,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  response.status(statusCode).json(payload);
};
