/**
 * Booking request schemas.
 *
 * Dates come in as ISO strings over the wire; Zod coerces them to `Date`.
 * Slot rule: `startTime` must be in the future and `endTime` must be after it.
 */
import { z } from "zod";

export const createBookingSchema = z
  .object({
    date: z.coerce.date(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.endTime <= val.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime must be after startTime",
      });
    }
    if (val.startTime.getTime() < Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "startTime must be in the future",
      });
    }
  });

export const bookingIdParam = z.object({
  id: z.string().uuid(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
