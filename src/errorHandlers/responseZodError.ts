import { ZodError } from "zod";

export function zodToErrorResponseBody(err: ZodError): {
  error: { message: string; code: string; errors: Array<{ message: string; path: string[] }> };
} {
  const errors = err.errors.map((e) => ({
    message: e.message,
    path: e.path.map(String),
  }));
  return {
    error: {
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors,
    },
  };
}
