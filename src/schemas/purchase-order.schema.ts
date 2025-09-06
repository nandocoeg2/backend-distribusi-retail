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

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    customerId: z.string().optional(),
    po_number: z.string().optional(),
    total_items: z.number().int().optional(),
    tanggal_order: z.string().datetime().optional(),
    po_type: z.nativeEnum(POType).optional(),
    statusId: z.string().optional(),
    suratJalan: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    suratPO: z.string().optional(),
    suratPenagihan: z.string().optional(),
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
