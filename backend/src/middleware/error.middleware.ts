/**
 * Centralized error handler.
 *
 * All thrown errors — whether `ApiError`, Prisma errors, Zod errors, or
 * unexpected crashes — funnel through here so clients get a consistent JSON
 * shape: `{ message, details? }`. Stack traces are hidden in production.
 */
import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/env";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required in signature for Express to recognize this as an error handler.
  _next: NextFunction,
): void {
  // Known HTTP errors we built ourselves.
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }

  // Zod validation failures — shouldn't normally reach here (the validate
  // middleware catches them) but defensive coding matters.
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Prisma-specific translations.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Unique constraint violation — most commonly our `unique_slot` index.
      res.status(409).json({
        message: "Resource already exists",
        details: { fields: err.meta?.target },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }
  }

  // Unknown / unexpected — log server-side, respond generically.
  logger.error("Unhandled error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    message: "Internal server error",
    ...(isProd ? {} : { details: err instanceof Error ? err.message : String(err) }),
  });
}
