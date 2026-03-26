import type { Product } from "../entities/Product";
import type { PaginatedResult } from "./IProductRepository";

export interface IProductListCache {
  get(page: number, pageSize: number): Promise<PaginatedResult<Product> | null>;
  set(page: number, pageSize: number, value: PaginatedResult<Product>): Promise<void>;
  invalidateAll(): Promise<void>;
}
