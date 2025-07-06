import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Database connection error", error);
    process.exit(1);
  }
};
