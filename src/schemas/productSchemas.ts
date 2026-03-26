import { z } from "zod";
import { productErrorMsg } from "../constants/productError";

export const createProductBodySchema = z.object({
  name: z.string().min(1, { message: productErrorMsg.NAME_REQUIRED }).max(255),
  description: z.string().max(10000).optional().nullable(),
  price: z.number().positive({ message: productErrorMsg.PRICE_POSITIVE }).max(1_000_000),
  stock: z
    .number()
    .int()
    .min(0, { message: productErrorMsg.STOCK_NON_NEGATIVE })
    .max(1_000_000_000),
});


export const updateProductBodySchema = z
  .object({
    name: z.string().min(1, { message: productErrorMsg.NAME_REQUIRED }).max(255).optional(),
    description: z.string().max(10000).optional().nullable(),
    price: z.number().positive({ message: productErrorMsg.PRICE_POSITIVE }).max(1_000_000).optional(),
    stock: z
      .number()
      .int()
      .min(0, { message: productErrorMsg.STOCK_NON_NEGATIVE })
      .max(1_000_000_000)
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.price !== undefined ||
      data.stock !== undefined,
    { message: productErrorMsg.UPDATE_EMPTY }
  );

export const patchProductStockBodySchema = z.object({
  stock: z
    .number()
    .int()
    .min(0, { message: productErrorMsg.STOCK_NON_NEGATIVE })
    .max(1_000_000_000),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
