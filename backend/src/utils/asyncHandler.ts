/**
 * Wraps an async Express handler so rejected promises flow through `next()`
 * and land in the central error middleware — no more try/catch boilerplate in
 * every controller.
 */
import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
