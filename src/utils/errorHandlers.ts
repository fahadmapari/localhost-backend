interface CustomError extends Error {
  statusCode?: number;
}

export const throwError = (message: string, statusCode?: number) => {
  const error: CustomError = new Error(message) as CustomError;
  error.statusCode = statusCode || 500;
  throw error;
};
