import type { Product, ProductCreateInput, ProductUpdateInput } from "../entities/Product";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export interface IProductRepository {
  create(input: ProductCreateInput): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  update(id: number, input: ProductUpdateInput): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
  list(params: { page: number; pageSize: number }): Promise<PaginatedResult<Product>>;
}
