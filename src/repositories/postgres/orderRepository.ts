import type { DataSource } from "typeorm";
import type { Order, OrderItem, OrderLineInput } from "../../entities/Order";
import type { PaginatedResult, PaginationParams } from "../../libs/pagination";
import { Pagination } from "../../libs/pagination";
import type { IOrderRepository } from "../../ports/IOrderRepository";
import { ConflictError, NotFoundError, ValidationAppError } from "../../errorHandlers/responseError";
import { ProductOrmEntity } from "../../orm/entities/Product.orm.entity";
import { OrderOrmEntity, OrderItemOrmEntity } from "../../orm/entities/order.entities";

function mapItem(e: OrderItemOrmEntity): OrderItem {
  return {
    id: e.id,
    orderId: e.orderId,
    productId: e.productId,
    quantity: e.quantity,
    unitPriceCents: Number(e.unitPriceCents),
  };
}

function mapOrder(o: OrderOrmEntity, items: OrderItemOrmEntity[]): Order {
  const sorted = [...items].sort((a, b) => a.id - b.id);
  return {
    id: o.id,
    status: o.status as Order["status"],
    totalCents: Number(o.totalCents),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: sorted.map(mapItem),
  };
}

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private readonly ds: DataSource) {}

  private get orderRepo() {
    return this.ds.getRepository(OrderOrmEntity);
  }

  async findById(id: number): Promise<Order | null> {
    const o = await this.orderRepo.findOne({
      where: { id },
      relations: ["items"],
    });
    if (!o) return null;
    return mapOrder(o, o.items ?? []);
  }

  async list(params: PaginationParams): Promise<PaginatedResult<Order>> {
    const offset = Pagination.offset(params);
    const total = await this.orderRepo.count();
    const rows = await this.orderRepo.find({
      relations: ["items"],
      order: { createdAt: "DESC" },
      skip: offset,
      take: params.pageSize,
    });
    return {
      items: rows.map((o) => mapOrder(o, o.items ?? [])),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async createOrderWithItems(lines: OrderLineInput[]): Promise<Order> {
    if (!lines.length) {
      throw new ValidationAppError("Order must contain at least one line item");
    }

    const quantities = new Map<number, number>();
    for (const line of lines) {
      quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
    }
    const uniqueIds = [...quantities.keys()].sort((a, b) => a - b);

    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const locked = await qr.manager
        .createQueryBuilder(ProductOrmEntity, "p")
        .where("p.id IN (:...ids)", { ids: uniqueIds })
        .orderBy("p.id", "ASC")
        .setLock("pessimistic_write")
        .getMany();

      if (locked.length !== uniqueIds.length) {
        throw new NotFoundError("Product");
      }

      const byId = new Map<number, { priceCents: number; stock: number }>();
      for (const p of locked) {
        byId.set(p.id, { priceCents: Number(p.priceCents), stock: p.stock });
      }

      let totalCents = 0;
      for (const [productId, qty] of quantities) {
        const p = byId.get(productId)!;
        if (p.stock < qty) {
          throw new ValidationAppError(`Insufficient stock for product ${productId}`);
        }
        totalCents += p.priceCents * qty;
      }

      const orderRow = qr.manager.create(OrderOrmEntity, {
        status: "confirmed",
        totalCents: String(totalCents),
      });
      const savedOrder = await qr.manager.save(orderRow);

      for (const [productId, qty] of quantities) {
        const p = byId.get(productId)!;
        const line = qr.manager.create(OrderItemOrmEntity, {
          order: savedOrder,
          productId,
          quantity: qty,
          unitPriceCents: String(p.priceCents),
        });
        await qr.manager.save(line);
        await qr.query(`UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1`, [
          productId,
          qty,
        ]);
      }

      await qr.commitTransaction();

      const full = await this.findById(savedOrder.id);
      if (!full) throw new Error("Order persist failed");
      return full;
    } catch (e) {
      if (qr.isTransactionActive) {
        await qr.rollbackTransaction();
      }
      throw e;
    } finally {
      await qr.release();
    }
  }

  async cancelOrder(id: number): Promise<Order | null> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Lock only `orders` — loading with relations + pessimistic_write joins `order_items` and
      // PostgreSQL rejects FOR UPDATE on the nullable side of an outer join.
      const o = await qr.manager.findOne(OrderOrmEntity, {
        where: { id },
        lock: { mode: "pessimistic_write" },
      });

      if (!o) {
        await qr.rollbackTransaction();
        return null;
      }

      if (o.status === "cancelled") {
        await qr.rollbackTransaction();
        throw new ConflictError("Order is already cancelled");
      }

      const items = await qr.manager.find(OrderItemOrmEntity, {
        where: { order: { id: o.id } },
      });

      for (const item of items) {
        await qr.query(
          `UPDATE products SET stock = stock + $2, updated_at = NOW() WHERE id = $1`,
          [item.productId, item.quantity]
        );
      }

      o.status = "cancelled";
      await qr.manager.save(o);

      await qr.commitTransaction();

      return this.findById(id);
    } catch (e) {
      if (qr.isTransactionActive) {
        await qr.rollbackTransaction();
      }
      throw e;
    } finally {
      await qr.release();
    }
  }
}
