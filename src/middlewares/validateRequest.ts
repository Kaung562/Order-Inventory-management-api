import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { z } from "zod";
import { ZodError } from "zod";
import { zodToErrorResponseBody } from "../errorHandlers/responseZodError";

export type ValidateSchemas = {
  body?: z.ZodType<unknown>;
  query?: z.ZodType<unknown>;
  params?: z.ZodType<unknown>;
};

/**
 * Validates query / params / body with Zod and stores results on `res.locals.validated`.
 * On failure responds with **422** and an error list (video-management-ms ExtendedZodError style).
 */
export function validateRequest(schemas: ValidateSchemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated: { query?: unknown; params?: unknown; body?: unknown } = {};
      if (schemas.query) validated.query = schemas.query.parse(req.query);
      if (schemas.params) validated.params = schemas.params.parse(req.params);
      if (schemas.body) validated.body = schemas.body.parse(req.body);
      res.locals.validated = validated;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(422).json(zodToErrorResponseBody(e));
        return;
      }
      next(e);
    }
  };
}
