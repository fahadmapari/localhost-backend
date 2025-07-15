import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["super_admin", "admin", "client", "supplier"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export type UserDocument = InferSchemaType<typeof userSchema>;

export default User;
