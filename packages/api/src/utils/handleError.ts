// utils/handleError.ts
import { Prisma } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";

// Define your app's custom error structure
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// Standard API error response shape
const formatError = (
  message: string,
  statusCode: number,
  details?: unknown
) => ({
  success: false,
  error: {
    message,
    statusCode,
    ...(details ? { details } : {}),
  },
});

// Main handler
export function handleError(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(formatError(err.message, err.statusCode));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json(formatError("Duplicate entry", 409));
      case "P2025":
        return res.status(404).json(formatError("Record not found", 404));
      default:
        return res
          .status(400)
          .json(formatError("Database error", 400, err.message));
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(422).json(formatError("Invalid data", 422, err.message));
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json(formatError("Invalid JSON payload", 400));
  }

  // Fallback for unhandled errors
  return res.status(500).json(formatError("Something went wrong", 500));
}
