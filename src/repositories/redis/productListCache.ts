import Redis from "ioredis";
import type { PaginatedResult } from "../../ports/IProductRepository";
import type { IProductListCache } from "../../ports/IProductListCache";
import type { Product } from "../../entities/Product";

const PREFIX = "products:list:";
const DEFAULT_TTL_SEC = 60;

export class ProductListCache implements IProductListCache {
  constructor(
    private readonly redis: Redis | null,
    private readonly ttlSec = DEFAULT_TTL_SEC
  ) {}

  private key(page: number, pageSize: number): string {
    return `${PREFIX}${page}:${pageSize}`;
  }

  async get(page: number, pageSize: number): Promise<PaginatedResult<Product> | null> {
    if (!this.redis) return null;
    const raw = await this.redis.get(this.key(page, pageSize));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        items: Array<Omit<Product, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string }>;
        total: number;
        page: number;
        pageSize: number;
      };
      return {
        items: parsed.items.map((p) => ({
          ...p,
          id: Number(p.id),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })),
        total: parsed.total,
        page: parsed.page,
        pageSize: parsed.pageSize,
      };
    } catch {
      return null;
    }
  }

  async set(page: number, pageSize: number, value: PaginatedResult<Product>): Promise<void> {
    if (!this.redis) return;
    const payload = {
      items: value.items.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total: value.total,
      page: value.page,
      pageSize: value.pageSize,
    };
    await this.redis.setex(this.key(page, pageSize), this.ttlSec, JSON.stringify(payload));
  }

  async invalidateAll(): Promise<void> {
    if (!this.redis) return;
    const stream = this.redis.scanStream({ match: `${PREFIX}*` });
    const keys: string[] = [];
    for await (const batch of stream) {
      keys.push(...batch);
    }
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}

export function createRedis(url: string | undefined): Redis | null {
  if (!url) return null;
  return new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
}
