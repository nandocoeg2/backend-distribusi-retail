import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createInventorySchema = z.object({
  body: z.object({
    plu: z.string({
      required_error: 'PLU is required',
    }).describe('Price Look-Up code'),
    nama_barang: z.string({
      required_error: 'Nama barang is required',
    }).describe('Name of the item'),
    stok_c: z.number({
      required_error: 'Stok karton is required',
    }).describe('Stock in cartons'),
    stok_q: z.number({
      required_error: 'Stok pcs is required',
    }).describe('Stock in pieces'),
    harga_barang: z.number({
      required_error: 'Harga barang is required',
    }).describe('Price of the item'),
    min_stok: z.number().optional().default(10).describe('Minimum stock level'),
    createdBy: z.string().optional().describe('User who created the inventory item'),
    updatedBy: z.string().optional().describe('User who updated the inventory item'),
  }),
});

export const updateInventorySchema = z.object({
  body: z.object({
    plu: z.string().optional().describe('Price Look-Up code'),
    nama_barang: z.string().optional().describe('Name of the item'),
    stok_c: z.number().optional().describe('Stock in cartons'),
    stok_q: z.number().optional().describe('Stock in pieces'),
    harga_barang: z.number().optional().describe('Price of the item'),
    min_stok: z.number().optional().describe('Minimum stock level'),
    updatedBy: z.string().optional().describe('User who updated the inventory item'),
  }),
  params: z.object({
    id: z.string().describe('The ID of the inventory item'),
  }),
});

export const getOrDeleteInventorySchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the inventory item'),
  }),
});

export const getAllInventoriesSchema = z.object({
  query: paginationSchema,
});

export const searchInventorySchema = z.object({
  query: z.object({
    q: z.string().optional().describe('Search query'),
  }).merge(paginationSchema),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>['body'];
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type GetAllInventoriesInput = z.infer<typeof getAllInventoriesSchema>;
export type SearchInventoryInput = z.infer<typeof searchInventorySchema>;

