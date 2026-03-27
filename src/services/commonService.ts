import type { NextFunction, Response } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../errorHandlers/responseError";
import { zodToErrorResponseBody } from "../errorHandlers/responseZodError";

export function errorResponse(err: unknown, res: Response, next: NextFunction): void {
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
  next(err);
}
