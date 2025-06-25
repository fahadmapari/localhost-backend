import { ErrorRequestHandler } from "express";

const globalErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  try {
    let error = { ...err };

    error.message = err.message;

    // Mongoose bad objectID
    if (error.name === "CastError") {
      const message = "Resource not found";
      error = new Error(message);
      error.statusCode = 404;
    }

    if (error.code === 11000) {
      const message = "Duplicate entry";
      error = new Error(message);
      error.statusCode = 400;
    }

    if (error.name === "ValidationError") {
      const message = "Invalid data";
      error = new Error(message);
      error.statusCode = 400;
    }

    console.log(error);

    res.status(error.statusCode || 500).json({
      success: false,
      error: error?.message || "server error",
    });
  } catch (e) {
    next(e);
  }
};

export default globalErrorMiddleware;
