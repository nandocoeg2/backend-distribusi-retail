import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createInventorySchema = z.object({
  body: z.object({
    plu: z.string({
      required_error: 'PLU is required',
    }),
    nama_barang: z.string({
      required_error: 'Nama barang is required',
    }),
    stok_c: z.number({
      required_error: 'Stok karton is required',
    }),
    stok_q: z.number({
      required_error: 'Stok pcs is required',
    }),
    harga_barang: z.number({
      required_error: 'Harga barang is required',
    }),
    min_stok: z.number().optional().default(10),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const updateInventorySchema = z.object({
  body: z.object({
    plu: z.string().optional(),
    nama_barang: z.string().optional(),
    stok_c: z.number().optional(),
    stok_q: z.number().optional(),
    harga_barang: z.number().optional(),
    min_stok: z.number().optional(),
    updatedBy: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const getOrDeleteInventorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const getAllInventoriesSchema = z.object({
  query: paginationSchema,
});

export const searchInventorySchema = z.object({
  query: z.object({
    q: z.string().optional(),
  }).merge(paginationSchema),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>['body'];
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type GetAllInventoriesInput = z.infer<typeof getAllInventoriesSchema>;
export type SearchInventoryInput = z.infer<typeof searchInventorySchema>;

