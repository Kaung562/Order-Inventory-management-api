import { ProductService } from "../../src/services/productService";
import type { IProductRepository } from "../../src/interfaces/IProductRepository";
import type { IProductListCache } from "../../src/interfaces/IProductListCache";
import type { Product } from "../../src/interfaces/productInterface";

const baseProduct = (over: Partial<Product> = {}): Product => ({
  id: 1,
  name: "Widget",
  description: null,
  priceCents: 999,
  stock: 10,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
  ...over,
});

describe("ProductService", () => {
  let repo: jest.Mocked<IProductRepository>;
  let cache: jest.Mocked<IProductListCache>;
  let service: ProductService;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidateAll: jest.fn(),
    };
    service = new ProductService(repo, cache);
  });

  it("returns cached list when present", async () => {
    const page = { items: [baseProduct()], total: 1, page: 1, pageSize: 20 };
    cache.get.mockResolvedValue(page);

    const result = await service.list(1, 20);

    expect(result).toEqual(page);
    expect(repo.list).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("loads from repository and sets cache on miss", async () => {
    cache.get.mockResolvedValue(null);
    const page = { items: [baseProduct()], total: 1, page: 1, pageSize: 20 };
    repo.list.mockResolvedValue(page);

    const result = await service.list(1, 20);

    expect(result).toEqual(page);
    expect(repo.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(cache.set).toHaveBeenCalledWith(1, 20, page);
  });

  it("invalidates cache after create", async () => {
    const p = baseProduct();
    repo.create.mockResolvedValue(p);

    await service.create({
      name: "Widget",
      description: null,
      priceCents: 999,
      stock: 10,
    });

    expect(cache.invalidateAll).toHaveBeenCalled();
  });

  it("works without cache", async () => {
    const svc = new ProductService(repo, null);
    const page = { items: [baseProduct()], total: 1, page: 1, pageSize: 20 };
    repo.list.mockResolvedValue(page);

    const result = await svc.list(1, 20);

    expect(result).toEqual(page);
    expect(repo.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(cache.invalidateAll).not.toHaveBeenCalled();
  });
});
