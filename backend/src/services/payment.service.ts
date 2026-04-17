/**
 * Payment service — Stripe Checkout.
 *
 * Flow:
 *   1. Client calls POST /bookings. We create a PENDING_PAYMENT booking.
 *   2. Service calls `createCheckoutSession` here, which returns a hosted
 *      Stripe URL. We stash the session id on the booking.
 *   3. Client redirects the user to that URL. Stripe handles all card data.
 *   4. On payment completion, Stripe hits our webhook. We verify the
 *      signature and flip the booking to CONFIRMED.
 *
 * We pass the booking id through `client_reference_id` and also in metadata
 * so the webhook can correlate even if Stripe data changes shape.
 */
import { stripe, stripeConfig } from "../config/stripe";
import { ApiError } from "../utils/ApiError";

interface CreateSessionArgs {
  bookingId: string;
  userEmail: string;
  priceCents: number;
  currency: string;
}

export async function createCheckoutSession(args: CreateSessionArgs) {
  if (!stripeConfig.webhookSecret && !process.env.STRIPE_SECRET_KEY) {
    // Without Stripe config, don't silently "succeed" — fail loudly.
    throw ApiError.internal("Stripe is not configured on this server");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: args.userEmail,
    client_reference_id: args.bookingId,
    metadata: { bookingId: args.bookingId },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: args.currency,
          unit_amount: args.priceCents,
          product_data: {
            name: "SmartReserve booking",
            description: `Booking ${args.bookingId}`,
          },
        },
      },
    ],
    success_url: `${stripeConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: stripeConfig.cancelUrl,
  });

  if (!session.url) throw ApiError.internal("Stripe did not return a checkout URL");
  return { id: session.id, url: session.url };
}

/**
 * Verifies the raw Stripe event. Call from the webhook route which MUST use
 * `express.raw({ type: "application/json" })` so signature bytes match.
 */
export function constructStripeEvent(rawBody: Buffer, signatureHeader: string) {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      stripeConfig.webhookSecret,
    );
  } catch (err) {
    throw ApiError.badRequest(
      `Stripe webhook signature verification failed: ${(err as Error).message}`,
    );
  }
}
