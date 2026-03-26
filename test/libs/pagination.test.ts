import {
  Pagination,
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_MAX_PAGE_SIZE,
  type PaginatedResult,
} from "../../src/libs/pagination";

describe("Pagination", () => {
  it("offset is (page - 1) * pageSize", () => {
    expect(Pagination.offset({ page: 1, pageSize: 20 })).toBe(0);
    expect(Pagination.offset({ page: 3, pageSize: 10 })).toBe(20);
  });

  it("totalPages", () => {
    expect(Pagination.totalPages(100, 20)).toBe(5);
    expect(Pagination.totalPages(0, 20)).toBe(0);
  });

  it("toResponse maps items and page meta", () => {
    const result: PaginatedResult<{ id: number }> = {
      items: [{ id: 1 }, { id: 2 }],
      total: 42,
      page: 2,
      pageSize: 20,
    };
    const json = Pagination.toResponse(result, (x) => ({ id: x.id }));
    expect(json.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(json.page).toEqual({
      total: 42,
      page: 2,
      pageSize: 20,
      totalPages: 3,
    });
  });

  it("exports defaults aligned with zod schema", () => {
    expect(PAGINATION_DEFAULT_PAGE_SIZE).toBe(20);
    expect(PAGINATION_MAX_PAGE_SIZE).toBe(100);
  });
});
