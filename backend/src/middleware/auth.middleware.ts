/**
 * Authentication middleware.
 *
 * Pulls a Bearer token from the `Authorization` header, verifies it, and
 * attaches the decoded claims to `req.user` for downstream handlers.
 *
 * We declare `AuthenticatedRequest` (not a global `Express.Request` merge) so
 * routes that require auth are type-asserted about it — the compiler helps
 * spot accidental use of `req.user` on a public route.
 */
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken, TokenPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing Bearer token"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
