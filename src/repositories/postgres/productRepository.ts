import type { DataSource } from "typeorm";
import type { Product, ProductCreateInput, ProductUpdateInput } from "../../entities/Product";
import { Pagination, type PaginatedResult, type PaginationParams } from "../../libs/pagination";
import type { IProductRepository } from "../../ports/IProductRepository";
import { ProductOrmEntity } from "../../orm/entities/Product.orm.entity";

function mapProduct(e: ProductOrmEntity): Product {
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    priceCents: Number(e.priceCents),
    stock: e.stock,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly ds: DataSource) {}

  private get repo() {
    return this.ds.getRepository(ProductOrmEntity);
  }

  async create(input: ProductCreateInput): Promise<Product> {
    const row = this.repo.create({
      name: input.name,
      description: input.description ?? null,
      priceCents: String(input.priceCents),
      stock: input.stock,
    });
    const saved = await this.repo.save(row);
    return mapProduct(saved);
  }

  async findById(id: number): Promise<Product | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? mapProduct(e) : null;
  }

  async update(id: number, input: ProductUpdateInput): Promise<Product | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;

    if (input.name !== undefined) existing.name = input.name;
    if (input.description !== undefined) existing.description = input.description;
    if (input.priceCents !== undefined) existing.priceCents = String(input.priceCents);
    if (input.stock !== undefined) existing.stock = input.stock;

    const saved = await this.repo.save(existing);
    return mapProduct(saved);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.repo.delete({ id });
    return (res.affected ?? 0) > 0;
  }

  async list(params: PaginationParams): Promise<PaginatedResult<Product>> {
    const offset = Pagination.offset(params);
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip: offset,
      take: params.pageSize,
    });
    return {
      items: rows.map(mapProduct),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }
}
