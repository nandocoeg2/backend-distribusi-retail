import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createItemPriceSchema = z.object({
  body: z.object({
    inventoryId: z.string({ required_error: 'Inventory ID is required' }),
    customerId: z.string({ required_error: 'Customer ID is required' }),
    harga: z.number({ required_error: 'Harga is required' }),
    pot1: z.number().optional(),
    harga1: z.number().optional(),
    pot2: z.number().optional(),
    harga2: z.number().optional(),
    ppn: z.number().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getItemPriceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateItemPriceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    inventoryId: z.string().optional(),
    customerId: z.string().optional(),
    harga: z.number().optional(),
    pot1: z.number().optional(),
    harga1: z.number().optional(),
    pot2: z.number().optional(),
    harga2: z.number().optional(),
    ppn: z.number().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteItemPriceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchItemPriceSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
});

export const getAllItemPricesSchema = z.object({
  query: paginationSchema,
});

export type CreateItemPriceInput = z.infer<typeof createItemPriceSchema>['body'];
export type UpdateItemPriceInput = z.infer<typeof updateItemPriceSchema>;
export type SearchItemPriceInput = z.infer<typeof searchItemPriceSchema>;
export type GetAllItemPricesInput = z.infer<typeof getAllItemPricesSchema>;
