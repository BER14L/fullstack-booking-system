/**
 * Central environment loader.
 *
 * Validated once at boot with Zod so that missing/malformed variables fail
 * loudly at startup instead of surfacing as mysterious runtime errors. Anywhere
 * else in the codebase, `import { env } from "@config/env"` — never touch
 * `process.env` directly.
 */
import dotenv from "dotenv";
import { z } from "zod";

// Only load .env outside of production. In prod we assume real env vars are
// set by the host (Render, Fly, Docker, etc.).
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_SUCCESS_URL: z.string().url().default("http://localhost:3000/payment/success"),
  STRIPE_CANCEL_URL: z.string().url().default("http://localhost:3000/payment/cancel"),

  BOOKING_PRICE_CENTS: z.coerce.number().int().positive().default(5000),
  BOOKING_CURRENCY: z.string().default("usd"),

  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().default("SmartReserve <no-reply@smartreserve.local>"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Convenience flag used by helpers (e.g. error handler hides stack in prod).
export const isProd = env.NODE_ENV === "production";

// CORS_ORIGIN can be a comma-separated list; normalize here once.
export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
