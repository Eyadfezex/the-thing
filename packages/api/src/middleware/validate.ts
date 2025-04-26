import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/handleError";

/**
 * Middleware to validate request body against a Zod schema.
 * You can extend this to validate `query`, `params`, etc.
 */
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return next(new AppError(errorMessage, 422));
    }

    // Replace request body with sanitized, parsed data
    req.body = result.data;

    next();
  };
