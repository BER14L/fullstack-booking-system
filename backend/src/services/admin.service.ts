/**
 * Admin service — read-only aggregations over the whole DB.
 *
 * Pagination is deliberately simple (offset/limit) — swap for cursor pagination
 * when row counts grow large enough that `OFFSET` is painful.
 */
import { prisma } from "../config/prisma";
import { BookingStatus } from "@prisma/client";

const MAX_PAGE_SIZE = 100;

export async function listAllUsers(page = 1, pageSize = 25) {
  const take = Math.min(pageSize, MAX_PAGE_SIZE);
  const skip = (Math.max(page, 1) - 1) * take;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return { items, total, page, pageSize: take };
}

export async function listAllBookings(page = 1, pageSize = 25) {
  const take = Math.min(pageSize, MAX_PAGE_SIZE);
  const skip = (Math.max(page, 1) - 1) * take;
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take,
      orderBy: { startTime: "desc" },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    prisma.booking.count(),
  ]);
  return { items, total, page, pageSize: take };
}

export async function getAnalytics() {
  const [totalBookings, totalUsers, confirmed, cancelled, pending, revenueAgg] =
    await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { status: BookingStatus.PENDING_PAYMENT } }),
      prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED },
        _sum: { priceCents: true },
      }),
    ]);

  return {
    totalUsers,
    totalBookings,
    statusBreakdown: {
      confirmed,
      cancelled,
      pendingPayment: pending,
    },
    // Revenue is confirmed-only. Returned in smallest currency unit.
    revenueCents: revenueAgg._sum.priceCents ?? 0,
  };
}
