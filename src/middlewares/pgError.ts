import type { Request, Response, NextFunction } from "express";

export function pgErrorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;
    if (code === "23503") {
      res.status(409).json({
        error: {
          message: "Cannot delete or update: resource is referenced by existing orders",
          code: "FK_VIOLATION",
        },
      });
      return;
    }
    if (code === "23505") {
      res.status(409).json({
        error: {
          message: "Duplicate value violates unique constraint",
          code: "UNIQUE_VIOLATION",
        },
      });
      return;
    }
  }
  next(err);
}
