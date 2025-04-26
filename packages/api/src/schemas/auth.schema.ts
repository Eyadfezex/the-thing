// schemas/user.schema.ts
import { z } from "zod";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const createUserSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, "Invalid email format"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, "Invalid email format"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
