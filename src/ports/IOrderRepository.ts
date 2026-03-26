import type { Order, OrderLineInput } from "../entities/Order";

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  list(params: { page: number; pageSize: number }): Promise<{
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  createOrderWithItems(lines: OrderLineInput[]): Promise<Order>;
  cancelOrder(id: number): Promise<Order | null>;
}
