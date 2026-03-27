import type { IOrderRepository } from "../interfaces/IOrderRepository";
import type { IProductListCache } from "../interfaces/IProductListCache";
import type { Order, OrderLineInput } from "../interfaces/orderInterface";
import { NotFoundError } from "../errorHandlers/responseError";

export class OrderService {
  constructor(
    private readonly repo: IOrderRepository,
    private readonly productListCache: IProductListCache | null = null
  ) {}

  async create(lines: OrderLineInput[]): Promise<Order> {
    const order = await this.repo.createOrderWithItems(lines);
    await this.productListCache?.invalidateAll();
    return order;
  }

  async getById(id: number): Promise<Order> {
    const o = await this.repo.findById(id);
    if (!o) throw new NotFoundError("Order", id);
    return o;
  }

  async list(page: number, pageSize: number) {
    return this.repo.list({ page, pageSize });
  }

  async cancel(id: number): Promise<Order> {
    const o = await this.repo.cancelOrder(id);
    if (!o) throw new NotFoundError("Order", id);
    await this.productListCache?.invalidateAll();
    return o;
  }
}
