/**
 * Admin service — HTTP wrappers for /admin endpoints. Reached only by pages
 * guarded by `requireRole("ADMIN")` on the server; the service itself does
 * not enforce anything.
 */
import { api } from "@/lib/axios";
import type { Analytics, Booking, User } from "@/types";

interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listUsers(page = 1): Promise<Paginated<User>> {
  const { data } = await api.get<Paginated<User>>("/admin/users", {
    params: { page },
  });
  return data;
}

export async function listBookings(page = 1): Promise<Paginated<Booking>> {
  const { data } = await api.get<Paginated<Booking>>("/admin/bookings", {
    params: { page },
  });
  return data;
}

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await api.get<Analytics>("/admin/analytics");
  return data;
}
