import { z } from "zod";
import { orderErrorMsg } from "../constants/orderError";

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.number().int().positive({ message: orderErrorMsg.QUANTITY_POSITIVE }).max(1_000_000),
      })
    )
    .min(1, { message: orderErrorMsg.ITEMS_REQUIRED }),
});
