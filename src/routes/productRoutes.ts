import { Router } from "express";
import type { ProductService } from "../services/productService";
import { validateRequest } from "../middlewares/validateRequest";
import { createProductController } from "../controllers/productController";
import { paginationQuerySchema } from "../schemas/paginationSchemas";
import {
  createProductBodySchema,
  productIdParamSchema,
  updateProductBodySchema,
} from "../schemas/productSchemas";

export function createProductRoutes(service: ProductService): Router {
  const router = Router();
  const c = createProductController(service);

  router.get("/", validateRequest({ query: paginationQuerySchema }), c.list);

  router.get("/:id", validateRequest({ params: productIdParamSchema }), c.getById);

  router.post("/", validateRequest({ body: createProductBodySchema }), c.create);

  router.patch(
    "/:id",
    validateRequest({ params: productIdParamSchema, body: updateProductBodySchema }),
    c.update
  );

  router.delete("/:id", validateRequest({ params: productIdParamSchema }), c.remove);

  return router;
}
