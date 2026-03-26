import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import type { OrderService } from "../services/orderService";
import { errorResponse } from "../services/commonService";
import { Pagination } from "../libs/pagination";
import { orderToResponse } from "../libs/responseMappers";
import { paginationQuerySchema } from "../schemas/paginationSchemas";
import { createOrderBodySchema, orderIdParamSchema } from "../schemas/orderSchemas";

type PaginationQuery = z.infer<typeof paginationQuerySchema>;
type CreateBody = z.infer<typeof createOrderBodySchema>;
type IdParams = z.infer<typeof orderIdParamSchema>;

export function createOrderController(service: OrderService) {
  return {
    list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { page, pageSize } = res.locals.validated!.query as PaginationQuery;
        const result = await service.list(page, pageSize);
        res.json(Pagination.toResponse(result, orderToResponse));
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    getById: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = res.locals.validated!.params as IdParams;
        const o = await service.getById(id);
        res.json({ data: orderToResponse(o) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    create: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = res.locals.validated!.body as CreateBody;
        const o = await service.create(body.items);
        res.status(201).json({ data: orderToResponse(o) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    cancel: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = res.locals.validated!.params as IdParams;
        const o = await service.cancel(id);
        res.json({ data: orderToResponse(o) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },
  };
}
