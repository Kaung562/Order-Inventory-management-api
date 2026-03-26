import type { Product } from "../entities/Product";
import type { Order } from "../entities/Order";

export function productToResponse(p: Product) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    price: p.priceCents / 100,
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function orderToResponse(o: Order) {
  return {
    id: o.id,
    status: o.status,
    totalCents: o.totalCents,
    total: o.totalCents / 100,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      unitPrice: i.unitPriceCents / 100,
    })),
  };
}
