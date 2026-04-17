/**
 * Stripe client singleton.
 *
 * Pinned API version so we don't get silently broken by Stripe's non-breaking
 * upgrades. Bump deliberately when upgrading.
 */
import Stripe from "stripe";
import { env } from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const stripeConfig = {
  successUrl: env.STRIPE_SUCCESS_URL,
  cancelUrl: env.STRIPE_CANCEL_URL,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  price: env.BOOKING_PRICE_CENTS,
  currency: env.BOOKING_CURRENCY,
};
