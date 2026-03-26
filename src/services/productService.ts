import type { PaginatedResult } from "../libs/pagination";
import type { IProductRepository } from "../ports/IProductRepository";
import type { IProductListCache } from "../ports/IProductListCache";
import type { Product, ProductCreateInput, ProductUpdateInput } from "../entities/Product";
import { NotFoundError } from "../errorHandlers/responseError";

export class ProductService {
  constructor(
    private readonly repo: IProductRepository,
    private readonly cache: IProductListCache | null
  ) {}

  async create(input: ProductCreateInput): Promise<Product> {
    const p = await this.repo.create(input);
    await this.cache?.invalidateAll();
    return p;
  }

  async getById(id: number): Promise<Product> {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundError("Product", id);
    return p;
  }

  async update(id: number, input: ProductUpdateInput): Promise<Product> {
    const p = await this.repo.update(id, input);
    if (!p) throw new NotFoundError("Product", id);
    await this.cache?.invalidateAll();
    return p;
  }

  async delete(id: number): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundError("Product", id);
    await this.cache?.invalidateAll();
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<Product>> {
    const cached = await this.cache?.get(page, pageSize);
    if (cached) return cached;

    const result = await this.repo.list({ page, pageSize });
    await this.cache?.set(page, pageSize, result);
    return result;
  }
}
