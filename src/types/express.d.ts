export {};

declare global {
  namespace Express {
    interface Locals {
      validated?: {
        query?: unknown;
        params?: unknown;
        body?: unknown;
      };
    }
  }
}
