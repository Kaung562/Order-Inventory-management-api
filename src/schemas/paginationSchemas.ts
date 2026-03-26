import { z } from "zod";
import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_MAX_PAGE_SIZE,
} from "../libs/pagination";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_MAX_PAGE_SIZE)
    .default(PAGINATION_DEFAULT_PAGE_SIZE),
});
