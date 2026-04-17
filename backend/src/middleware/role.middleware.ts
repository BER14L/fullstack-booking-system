/**
 * Role-based access control.
 *
 * Compose with `authenticate` first so `req.user` is populated:
 *   router.get("/admin", authenticate, requireRole("ADMIN"), handler);
 */
import { NextFunction, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest } from "./auth.middleware";

type Role = "USER" | "ADMIN";

export const requireRole =
  (...allowed: Role[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient privileges"));
    }
    next();
  };
