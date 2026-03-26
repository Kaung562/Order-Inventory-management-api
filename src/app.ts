import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import type { DataSource } from "typeorm";
import type Redis from "ioredis";
import { assertDatabaseUrl, env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { APIPrefix } from "./config/apiPrefix";
import { PostgresProductRepository } from "./repositories/postgres/productRepository";
import { PostgresOrderRepository } from "./repositories/postgres/orderRepository";
import { ProductListCache, createRedis } from "./repositories/redis/productListCache";
import { ProductService } from "./services/productService";
import { OrderService } from "./services/orderService";
import { createProductRoutes } from "./routes/productRoutes";
import { createOrderRoutes } from "./routes/orderRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { pgErrorMiddleware } from "./middlewares/pgError";
import { buildOpenApiSpec } from "./config/swagger";

export type AppContext = {
  dataSource: DataSource;
  redis: Redis | null;
};

export function createApp(ctx?: Partial<AppContext>): { app: express.Express; context: AppContext } {
  assertDatabaseUrl();

  const dataSource = ctx?.dataSource ?? AppDataSource;
  const redisClient = ctx?.redis !== undefined ? ctx.redis : createRedis(env.redisUrl);

  const productRepo = new PostgresProductRepository(dataSource);
  const orderRepo = new PostgresOrderRepository(dataSource);
  const cache = new ProductListCache(redisClient);
  const productService = new ProductService(productRepo, cache);
  const orderService = new OrderService(orderRepo, cache);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.nodeEnv });
  });

  app.use(APIPrefix.products, createProductRoutes(productService));
  app.use(APIPrefix.orders, createOrderRoutes(orderService));

  const spec = buildOpenApiSpec();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

  app.use((_req, res) => {
    res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
  });

  app.use(pgErrorMiddleware);
  app.use(errorHandler);

  return { app, context: { dataSource, redis: redisClient } };
}
