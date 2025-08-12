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

export const changePasswordSchema = z
  .object({
    oldPassword: z.string("Old password is required."),
    newPassword: z.string("New password is required."),
    confirmPassword: z.string("Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword === data.newPassword, {
    message: "Old password and new password should not be same.",
    path: ["newPassword"],
  });
