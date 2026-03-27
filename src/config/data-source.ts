import "reflect-metadata";
import { DataSource } from "typeorm";
import { assertDatabaseUrl, env } from "./env";
import { ProductOrmEntity } from "../entities/Product";
import { OrderOrmEntity, OrderItemOrmEntity } from "../entities/Order";

function shouldSynchronize(): boolean {
  const v = process.env.DATABASE_SYNC;
  if (v === "false" || v === "0") return false;
  return true;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: assertDatabaseUrl(),
  entities: [ProductOrmEntity, OrderOrmEntity, OrderItemOrmEntity],
  synchronize: shouldSynchronize(),
  logging: env.nodeEnv === "development",
});
