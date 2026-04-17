/**
 * Zod validation middleware.
 *
 * Accepts a schema describing body / params / query and replaces each of those
 * properties with the parsed/typed result, so controllers can trust their
 * inputs.
 */
import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type Sources = "body" | "params" | "query";

type Schemas = Partial<Record<Sources, ZodSchema<unknown>>>;

export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      for (const key of Object.keys(schemas) as Sources[]) {
        const schema = schemas[key];
        if (!schema) continue;
        const parsed = schema.parse(req[key]);
        // @ts-expect-error — assigning into the specific source is safe here.
        req[key] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest("Validation failed", err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
