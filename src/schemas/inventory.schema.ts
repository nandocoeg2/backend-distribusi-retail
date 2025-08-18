import { z } from 'zod';

export const createInventorySchema = z.object({
  body: z.object({
    kode_barang: z.string({
      required_error: 'Kode barang is required',
    }),
    nama_barang: z.string({
      required_error: 'Nama barang is required',
    }),
    stok_barang: z.number({
      required_error: 'Stok barang is required',
    }),
    harga_barang: z.number({
      required_error: 'Harga barang is required',
    }),
    min_stok: z.number().optional().default(10),
  }),
});

export const updateInventorySchema = z.object({
  body: z.object({
    kode_barang: z.string().optional(),
    nama_barang: z.string().optional(),
    stok_barang: z.number().optional(),
    harga_barang: z.number().optional(),
    min_stok: z.number().optional(),
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

export type CreateInventoryInput = z.infer<typeof createInventorySchema>['body'];
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
