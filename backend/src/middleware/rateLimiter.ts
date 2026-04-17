/**
 * Rate limiters.
 *
 * - `globalLimiter`: soft cap on every API route to dampen abuse.
 * - `authLimiter`: stricter cap on auth endpoints where credential stuffing
 *   attacks are most likely.
 *
 * In production behind a proxy/load-balancer, set `app.set("trust proxy", 1)`
 * so real client IPs are honored.
 */
import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests — please slow down." },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many auth attempts — try again in a minute." },
});
