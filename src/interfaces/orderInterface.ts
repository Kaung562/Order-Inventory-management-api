export type OrderStatus = "confirmed" | "cancelled";

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPriceCents: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

export type OrderLineInput = {
  productId: number;
  quantity: number;
};
