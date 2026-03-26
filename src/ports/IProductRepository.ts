import type { Product, ProductCreateInput, ProductUpdateInput } from "../entities/Product";
import type { PaginatedResult, PaginationParams } from "../libs/pagination";

export interface IProductRepository {
  create(input: ProductCreateInput): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  update(id: number, input: ProductUpdateInput): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
  list(params: PaginationParams): Promise<PaginatedResult<Product>>;
}
