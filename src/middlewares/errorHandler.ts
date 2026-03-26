import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../errorHandlers/responseError";
import { zodToErrorResponseBody } from "../errorHandlers/responseZodError";

/** Express error-handling middleware (registered last). */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ResponseError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.errorCode,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json(zodToErrorResponseBody(err));
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
