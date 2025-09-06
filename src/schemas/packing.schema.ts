import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createPackingSchema = z.object({
  body: z.object({
    tanggal_packing: z.coerce.date(),
    statusId: z.string(),
    purchaseOrderId: z.string(),
    updatedBy: z.string().optional(),
    packingItems: z.array(z.object({
      nama_barang: z.string(),
      total_qty: z.number().int(),
      jumlah_carton: z.number().int(),
      isi_per_carton: z.number().int(),
      no_box: z.string(),
      inventoryId: z.string(),
    })),
  }),
});

export const getPackingSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updatePackingSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    tanggal_packing: z.coerce.date().optional(),
    statusId: z.string().optional(),
    updatedBy: z.string().optional(),
    packingItems: z.array(z.object({
      id: z.string().optional(),
      nama_barang: z.string(),
      total_qty: z.number().int(),
      jumlah_carton: z.number().int(),
      isi_per_carton: z.number().int(),
      no_box: z.string(),
      inventoryId: z.string(),
    })).optional(),
  }),
});

export const deletePackingSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchPackingSchema = z.object({
  query: z.object({
    tanggal_packing: z.string().optional(),
    statusId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
  }).merge(paginationSchema),
});

export type CreatePackingInput = z.infer<typeof createPackingSchema>['body'];
export type UpdatePackingInput = z.infer<typeof updatePackingSchema>;
export type SearchPackingInput = z.infer<typeof searchPackingSchema>;
