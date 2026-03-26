import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import type { ProductService } from "../services/productService";
import { errorResponse } from "../services/commonService";
import { productToResponse } from "../libs/responseMappers";
import { dollarsToCents } from "../libs/money";
import { paginationQuerySchema } from "../schemas/paginationSchemas";
import {
  createProductBodySchema,
  productIdParamSchema,
  updateProductBodySchema,
} from "../schemas/productSchemas";

type PaginationQuery = z.infer<typeof paginationQuerySchema>;
type CreateBody = z.infer<typeof createProductBodySchema>;
type UpdateBody = z.infer<typeof updateProductBodySchema>;
type IdParams = z.infer<typeof productIdParamSchema>;

export function createProductController(service: ProductService) {
  return {
    list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { page, pageSize } = res.locals.validated!.query as PaginationQuery;
        const result = await service.list(page, pageSize);
        res.json({
          data: result.items.map(productToResponse),
          page: {
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: Math.ceil(result.total / result.pageSize) || 0,
          },
        });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    getById: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = res.locals.validated!.params as IdParams;
        const p = await service.getById(id);
        res.json({ data: productToResponse(p) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    create: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = res.locals.validated!.body as CreateBody;
        const p = await service.create({
          name: body.name,
          description: body.description ?? null,
          priceCents: dollarsToCents(body.price),
          stock: body.stock,
        });
        res.status(201).json({ data: productToResponse(p) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    update: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = res.locals.validated!.params as IdParams;
        const body = res.locals.validated!.body as UpdateBody;
        const p = await service.update(id, {
          name: body.name,
          description: body.description,
          priceCents: body.price !== undefined ? dollarsToCents(body.price) : undefined,
          stock: body.stock,
        });
        res.json({ data: productToResponse(p) });
      } catch (e) {
        errorResponse(e, res, next);
      }
    },

    remove: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = res.locals.validated!.params as IdParams;
        await service.delete(id);
        res.status(204).send();
      } catch (e) {
        errorResponse(e, res, next);
      }
    },
  };
}
