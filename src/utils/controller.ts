import { Response } from "express";

export const sendResponse = (
  response: Response,
  message: string,
  success: boolean,
  statusCode: number,
  data?: any
) => {
  response.status(statusCode).json({
    success: success,
    message: message || (success ? "Request successful" : "Request failed"),
    data: data,
  });
  return;
};
