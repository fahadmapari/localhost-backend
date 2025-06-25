interface CustomError extends Error {
  statusCode?: number;
}

export const createError = (
  message: string,
  statusCode?: number
): CustomError => {
  const error: CustomError = new Error(message) as CustomError;
  error.statusCode = statusCode || 500;
  return error;
};
