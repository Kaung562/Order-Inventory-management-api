import { Router } from "express";
import type { OrderService } from "../services/orderService";
import { validateRequest } from "../middlewares/validateRequest";
import { createOrderController } from "../controllers/orderController";
import { paginationQuerySchema } from "../schemas/paginationSchemas";
import { createOrderBodySchema, orderIdParamSchema } from "../schemas/orderSchemas";

export function createOrderRoutes(service: OrderService): Router {
  const router = Router();
  const c = createOrderController(service);

  router.get("/", validateRequest({ query: paginationQuerySchema }), c.list);

  router.post("/:id/cancel", validateRequest({ params: orderIdParamSchema }), c.cancel);

  router.get("/:id", validateRequest({ params: orderIdParamSchema }), c.getById);

  router.post("/", validateRequest({ body: createOrderBodySchema }), c.create);

  return router;
}
