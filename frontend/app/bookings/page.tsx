"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookingCard } from "@/components/BookingCard";
import * as bookingService from "@/services/booking.service";
import { errorMessage } from "@/lib/axios";
import type { Booking } from "@/types";

function BookingsInner() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setBookings(await bookingService.listMy());
    } catch (err) {
      setError(errorMessage(err, "Failed to load bookings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCancel = async (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingService.cancel(id);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Cancel failed"));
    }
  };

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My bookings</h1>
        <Link href="/bookings/new" className="btn-primary">
          New booking
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-500">No bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <BookingCard booking={b} onCancel={onCancel} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsInner />
    </ProtectedRoute>
  );
}
