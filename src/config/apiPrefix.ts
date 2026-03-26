const raw = (process.env.API_PREFIX ?? "api").replace(/^\/+|\/+$/g, "");

export const APIPrefix = {
  base: raw ? `/${raw}` : "",
  products: raw ? `/${raw}/products` : "/products",
  orders: raw ? `/${raw}/orders` : "/orders",
} as const;
