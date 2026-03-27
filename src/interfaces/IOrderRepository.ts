import type { Order, OrderLineInput } from "./orderInterface";
import type { PaginatedResult, PaginationParams } from "../libs/pagination";

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  list(params: PaginationParams): Promise<PaginatedResult<Order>>;
  createOrderWithItems(lines: OrderLineInput[]): Promise<Order>;
  cancelOrder(id: number): Promise<Order | null>;
}
