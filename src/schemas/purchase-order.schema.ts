import { z } from 'zod';
import { POType } from '@prisma/client';
import { paginationSchema } from './pagination.schema';

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    customerId: z.string(),
    po_number: z.string(),
    total_items: z.coerce.number().int(),
    tanggal_order: z.string(),
    po_type: z.nativeEnum(POType),
    statusId: z.string(),
    suratJalan: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    suratPO: z.string().optional(),
    suratPenagihan: z.string().optional(),
  }),
});

export const getPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const purchaseOrderDetailSchema = z.object({
  id: z.string().optional(),
  kode_barang: z.string(),
  nama_barang: z.string(),
  quantity: z.coerce.number().int(),
  isi: z.coerce.number().int(),
  harga: z.coerce.number(),
  potongan_a: z.coerce.number().nullable().optional(),
  harga_after_potongan_a: z.coerce.number().nullable().optional(),
  harga_netto: z.coerce.number(),
  total_pembelian: z.coerce.number(),
  potongan_b: z.coerce.number().nullable().optional(),
  harga_after_potongan_b: z.coerce.number().nullable().optional(),
  inventoryId: z.string(),
});

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    customerId: z.string().optional(),
    po_number: z.string().optional(),
    total_items: z.number().int().optional(),
    tanggal_order: z.coerce.date().optional(),
    po_type: z.nativeEnum(POType).optional(),
    statusId: z.string().optional(),
    suratJalan: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    suratPO: z.string().optional(),
    suratPenagihan: z.string().optional(),
    purchaseOrderDetails: z.array(purchaseOrderDetailSchema).optional(),
  }),
});

export const deletePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchPurchaseOrderSchema = z.object({
  query: z.object({
    tanggal_order: z.string().optional(),
    customer_name: z.string().optional(),
    customerId: z.string().optional(),
    suratPO: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    po_number: z.string().optional(),
    supplierId: z.string().optional(),
    statusId: z.string().optional(),
  }).merge(paginationSchema),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>['body'];
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type SearchPurchaseOrderInput = z.infer<typeof searchPurchaseOrderSchema>;
export type HistoryPurchaseOrderInput = z.infer<typeof paginationSchema>;
