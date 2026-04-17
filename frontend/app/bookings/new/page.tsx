"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import * as bookingService from "@/services/booking.service";
import { errorMessage } from "@/lib/axios";

// HTML datetime-local emits "YYYY-MM-DDTHH:mm" — treat as the user's local
// timezone and let the Date constructor convert to ISO/UTC under the hood.
const schema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => new Date(v.endTime) > new Date(v.startTime), {
    path: ["endTime"],
    message: "End must be after start",
  });
type FormValues = z.infer<typeof schema>;

function NewBookingInner() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const start = new Date(values.startTime);
      // Day-of-booking; server re-normalizes to UTC 00:00 regardless.
      const date = new Date(
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
      );
      const { checkoutUrl } = await bookingService.create({
        date: date.toISOString(),
        startTime: start.toISOString(),
        endTime: new Date(values.endTime).toISOString(),
        notes: values.notes,
      });
      // Hand off to Stripe Checkout. Use window.location so the redirect survives
      // the client router.
      window.location.href = checkoutUrl;
    } catch (err) {
      setServerError(errorMessage(err, "Could not create booking"));
    }
  };

  return (
    <section className="mx-auto max-w-lg py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New booking</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="startTime">Start</label>
          <input
            id="startTime"
            type="datetime-local"
            className="input"
            {...register("startTime")}
          />
          {errors.startTime && (
            <p className="mt-1 text-xs text-red-600">{errors.startTime.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="endTime">End</label>
          <input
            id="endTime"
            type="datetime-local"
            className="input"
            {...register("endTime")}
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-600">{errors.endTime.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" className="input min-h-24" {...register("notes")} />
        </div>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <button disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Processing…" : "Continue to payment"}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-500">
        You&apos;ll be redirected to Stripe Checkout. Test cards work in dev
        (e.g. <code className="rounded bg-slate-100 px-1">4242 4242 4242 4242</code>).
      </p>
    </section>
  );
}

export default function NewBookingPage() {
  return (
    <ProtectedRoute>
      <NewBookingInner />
    </ProtectedRoute>
  );
}
