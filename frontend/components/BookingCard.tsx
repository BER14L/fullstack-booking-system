"use client";

import type { Booking } from "@/types";

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
}

const statusStyles: Record<Booking["status"], string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-100 text-slate-500 line-through",
};

export function BookingCard({ booking, onCancel }: Props) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const canCancel = booking.status !== "CANCELLED";

  return (
    <article className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            {start.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[booking.status]}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
          {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        {booking.notes && (
          <p className="mt-1 text-xs text-slate-500">{booking.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          {(booking.priceCents / 100).toLocaleString(undefined, {
            style: "currency",
            currency: booking.currency.toUpperCase(),
          })}
        </span>
        {onCancel && canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
