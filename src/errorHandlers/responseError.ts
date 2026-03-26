/** HTTP-facing errors (similar to video-management-ms `ResponseError` with numeric status). */
export class ResponseError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode = "ERROR"
  ) {
    super(message);
    this.name = "ResponseError";
  }
}

export class NotFoundError extends ResponseError {
  constructor(resource: string, id?: string | number) {
    const suffix = id !== undefined && id !== null ? String(id) : undefined;
    super(404, suffix ? `${resource} not found: ${suffix}` : `${resource} not found`, "NOT_FOUND");
  }
}

export class ValidationAppError extends ResponseError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class ConflictError extends ResponseError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}
