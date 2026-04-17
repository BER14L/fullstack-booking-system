/**
 * Booking service — HTTP wrappers for the /bookings endpoints.
 */
import { api } from "@/lib/axios";
import type { Booking, CreateBookingResponse } from "@/types";

export async function listMy(): Promise<Booking[]> {
  const { data } = await api.get<{ bookings: Booking[] }>("/bookings");
  return data.bookings;
}

export async function create(input: {
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<CreateBookingResponse> {
  const { data } = await api.post<CreateBookingResponse>("/bookings", input);
  return data;
}

export async function cancel(id: string): Promise<Booking> {
  const { data } = await api.delete<{ booking: Booking }>(`/bookings/${id}`);
  return data.booking;
}
