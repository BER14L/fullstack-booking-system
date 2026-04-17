/**
 * Payment controllers.
 *
 * `webhook` is mounted with `express.raw({ type: "application/json" })` so the
 * body is a Buffer — required for Stripe signature verification. Do NOT move
 * JSON parsing before this route.
 */
import { Request, Response } from "express";
import Stripe from "stripe";
import * as paymentService from "../services/payment.service";
import * as bookingService from "../services/booking.service";
import * as emailService from "../services/email.service";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

export async function webhook(req: Request, res: Response) {
  const sig = req.header("stripe-signature");
  if (!sig) {
    res.status(400).json({ message: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = paymentService.constructStripeEvent(req.body as Buffer, sig);
  } catch (err) {
    logger.warn("Stripe signature verification failed", {
      error: (err as Error).message,
    });
    res.status(400).json({ message: (err as Error).message });
    return;
  }

  // Ack fast; handle idempotently. Stripe retries on non-2xx.
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.id) {
        const updated = await bookingService.markConfirmedByStripeSession(session.id);
        if (updated) {
          const user = await prisma.user.findUnique({ where: { id: updated.userId } });
          if (user) {
            const tmpl = emailService.bookingConfirmationTemplate({
              userName: user.name,
              date: updated.date,
              startTime: updated.startTime,
              endTime: updated.endTime,
              bookingId: updated.id,
            });
            // Fire-and-forget: we already know the booking is confirmed; a
            // failing email shouldn't un-confirm it. We log but don't re-throw.
            emailService.sendEmail({ to: user.email, ...tmpl }).catch((e) => {
              logger.error("Failed to send booking confirmation", {
                message: (e as Error).message,
              });
            });
          }
        }
      }
    }
    // Add more event types (refunds, disputes, etc.) here as the product grows.
    res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Webhook handler error", { message: (err as Error).message });
    // Return 500 so Stripe retries. The DB operations are idempotent.
    res.status(500).json({ message: "Webhook handler failed" });
  }
}
