/**
 * Payment routes.
 *
 * The webhook route intentionally does NOT use the JSON parser — Stripe's
 * signature is computed over the raw body. See `server.ts` where we mount
 * `express.raw()` just for this route before the global JSON middleware.
 *
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Stripe webhook callbacks
 */
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook endpoint (raw body required)
 *     description: >
 *       Receives `checkout.session.completed` events and flips the matching
 *       booking to CONFIRMED. Signature is verified; unsigned requests are
 *       rejected.
 *     responses:
 *       200: { description: Event acknowledged }
 *       400: { description: Invalid signature }
 */
router.post("/webhook", asyncHandler(paymentController.webhook));

export default router;
