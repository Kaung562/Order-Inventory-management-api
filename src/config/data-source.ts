import "reflect-metadata";
import { DataSource } from "typeorm";
import { assertDatabaseUrl, env } from "./env";
import { ProductOrmEntity } from "../orm/entities/Product.orm.entity";
import { OrderOrmEntity, OrderItemOrmEntity } from "../orm/entities/order.entities";

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
