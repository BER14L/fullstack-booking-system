/**
 * Aggregates all routers under `/api`. Keeping one mount point means
 * `server.ts` stays short and versioning later (`/api/v2`) is trivial.
 */
import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";
import adminRoutes from "./admin.routes";
import paymentRoutes from "./payment.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);

export default router;
