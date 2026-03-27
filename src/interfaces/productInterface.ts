export type Product = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductCreateInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  stock: number;
};

export type ProductUpdateInput = {
  name?: string;
  description?: string | null;
  priceCents?: number;
  stock?: number;
};
