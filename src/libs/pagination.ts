/** Shared pagination types, defaults, and helpers for list endpoints and repositories. */

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_PAGE_SIZE = 20;
export const PAGINATION_MAX_PAGE_SIZE = 100;

export type PaginationParams = {
  page: number;
  pageSize: number;
};

/** Repository / service result for a single page. */
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** JSON `page` object returned by list APIs. */
export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedJsonResponse<T> = {
  data: T[];
  page: PaginationMeta;
};

/**
 * Common pagination utilities (offset, total pages, HTTP response shape).
 */
export class Pagination {
  static offset(params: PaginationParams): number {
    return (params.page - 1) * params.pageSize;
  }

  static totalPages(total: number, pageSize: number): number {
    if (pageSize <= 0) return 0;
    return Math.ceil(total / pageSize) || 0;
  }

  /** Build `{ data, page }` for list endpoints from a repository result and row mapper. */
  static toResponse<TItem, TOut>(
    result: PaginatedResult<TItem>,
    mapItem: (item: TItem) => TOut
  ): PaginatedJsonResponse<TOut> {
    return {
      data: result.items.map(mapItem),
      page: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Pagination.totalPages(result.total, result.pageSize),
      },
    };
  }
}
