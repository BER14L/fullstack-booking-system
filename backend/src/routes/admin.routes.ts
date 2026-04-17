/**
 * Admin routes — protected by both `authenticate` and `requireRole("ADMIN")`.
 *
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin-only listings and analytics
 */
import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get("/users", asyncHandler(adminController.users));

/**
 * @openapi
 * /admin/bookings:
 *   get:
 *     tags: [Admin]
 *     summary: List all bookings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get("/bookings", asyncHandler(adminController.bookings));

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard analytics (totals, revenue, status breakdown)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/analytics", asyncHandler(adminController.analytics));

export default router;
