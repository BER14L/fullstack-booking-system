/**
 * Booking service.
 *
 * Concurrency note:
 *   Double-booking prevention is layered:
 *   1. Prisma `$transaction` with a serialized check+insert: inside the tx, we
 *      query for any existing booking at the same slot (ignoring CANCELLED).
 *      If found, we bail before inserting.
 *   2. A unique index on `(date, startTime)` in Postgres — this is the
 *      authoritative guarantee. Even if two processes race past step 1, the
 *      DB will reject the second insert with P2002 and the error middleware
 *      returns a 409 Conflict.
 *
 * We normalize `date` to the UTC day so the unique index matches what an
 * admin would think of as "the same slot".
 */
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import type { CreateBookingInput } from "../validators/booking.validator";
import { env } from "../config/env";
import { Prisma, BookingStatus } from "@prisma/client";

function toUtcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function createBooking(userId: string, input: CreateBookingInput) {
  const date = toUtcDayStart(input.startTime);

  // The check-then-insert must be atomic; use an interactive transaction with
  // `Serializable` isolation so we don't see phantom rows from concurrent
  // inserts. The DB unique index is our final backstop either way.
  return prisma.$transaction(
    async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          date,
          startTime: input.startTime,
          // Cancelled bookings free up the slot.
          status: { not: BookingStatus.CANCELLED },
        },
        select: { id: true },
      });
      if (conflict) throw ApiError.conflict("That time slot is already taken");

      return tx.booking.create({
        data: {
          userId,
          date,
          startTime: input.startTime,
          endTime: input.endTime,
          notes: input.notes,
          status: BookingStatus.PENDING_PAYMENT,
          priceCents: env.BOOKING_PRICE_CENTS,
          currency: env.BOOKING_CURRENCY,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.userId !== userId) throw ApiError.forbidden("Not your booking");
  if (booking.status === BookingStatus.CANCELLED) {
    throw ApiError.badRequest("Booking is already cancelled");
  }
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
}

export async function listMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
  });
}

export async function getBookingById(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw ApiError.notFound("Booking not found");
  return booking;
}

export async function markConfirmedByStripeSession(sessionId: string) {
  // Idempotent: safe to call multiple times (webhook retries happen).
  const existing = await prisma.booking.findUnique({ where: { stripeSessionId: sessionId } });
  if (!existing) return null;
  if (existing.status === BookingStatus.CONFIRMED) return existing;
  return prisma.booking.update({
    where: { stripeSessionId: sessionId },
    data: { status: BookingStatus.CONFIRMED, paidAt: new Date() },
  });
}

export async function attachStripeSession(bookingId: string, sessionId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: sessionId },
  });
}
