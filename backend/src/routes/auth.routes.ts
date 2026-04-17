/**
 * Auth routes.
 *
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Registration, login, profile
 */
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { authLimiter } from "../middleware/rateLimiter";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email already registered }
 */
router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
