/**
 * Booking routes.
 *
 * @openapi
 * tags:
 *   - name: Bookings
 *     description: Create, list, and cancel bookings
 */
import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  bookingIdParam,
  createBookingSchema,
} from "../validators/booking.validator";

const router = Router();

router.use(authenticate); // all booking routes require auth

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings for the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", asyncHandler(bookingController.list));

/**
 * @openapi
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get one of the current user's bookings
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get(
  "/:id",
  validate({ params: bookingIdParam }),
  asyncHandler(bookingController.get),
);

/**
 * @openapi
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking and a Stripe Checkout session
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, endTime]
 *             properties:
 *               date: { type: string, format: date-time }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Created — returns booking + checkoutUrl }
 *       409: { description: Time slot already taken }
 */
router.post(
  "/",
  validate({ body: createBookingSchema }),
  asyncHandler(bookingController.create),
);

/**
 * @openapi
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Cancelled }
 *       403: { description: Not your booking }
 *       404: { description: Not found }
 */
router.delete(
  "/:id",
  validate({ params: bookingIdParam }),
  asyncHandler(bookingController.cancel),
);

export default router;
