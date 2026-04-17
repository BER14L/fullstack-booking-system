/**
 * Booking controllers.
 *
 * createBooking orchestrates two services (booking + payment) because the HTTP
 * contract is "POST /bookings returns {booking, checkoutUrl}" — keeping the
 * orchestration here (rather than inside the booking service) avoids creating
 * a circular dependency between services for a one-off flow.
 */
import { Response } from "express";
import * as bookingService from "../services/booking.service";
import * as paymentService from "../services/payment.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";

export async function list(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const bookings = await bookingService.listMyBookings(req.user.sub);
  res.status(200).json({ bookings });
}

export async function get(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const booking = await bookingService.getBookingById(req.user.sub, req.params.id);
  res.status(200).json({ booking });
}

export async function create(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const booking = await bookingService.createBooking(req.user.sub, req.body);

  // Hand off to Stripe for payment. If this fails, the booking still exists
  // as PENDING_PAYMENT — a later retry endpoint (future work) can create a
  // new session for it, or the user cancels.
  const session = await paymentService.createCheckoutSession({
    bookingId: booking.id,
    userEmail: req.user.email,
    priceCents: booking.priceCents,
    currency: booking.currency,
  });

  await bookingService.attachStripeSession(booking.id, session.id);

  res.status(201).json({
    booking,
    checkoutUrl: session.url,
  });
}

export async function cancel(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const updated = await bookingService.cancelBooking(req.user.sub, req.params.id);
  res.status(200).json({ booking: updated });
}
