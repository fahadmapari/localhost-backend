import { z } from "zod";

export const userSchema = z
  .object({
    name: z.string("Name is required."),
    email: z.email("A valid email is required."),
    password: z.string("Password is required."),
    confirmPassword: z.string("Password confirmation is required."),
    role: z.enum(["admin", "super admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
