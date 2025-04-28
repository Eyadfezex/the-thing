import { z } from "zod";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .regex(EMAIL_REGEX, {
      message: "Invalid email format",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(PASSWORD_REGEX, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 2 characters" })
      .regex(NAME_REGEX, {
        message: "Name can only contain letters and spaces",
      }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .regex(EMAIL_REGEX, {
        message: "Invalid email format",
      }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(PASSWORD_REGEX, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(PASSWORD_REGEX, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
