/**
 * Auth request schemas.
 *
 * Password rules are intentionally simple but sensible: min 8, must contain a
 * number and a letter. Tune to match your compliance posture.
 */
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(80),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
