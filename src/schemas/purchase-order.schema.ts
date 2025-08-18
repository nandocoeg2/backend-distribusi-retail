import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer UUID'),
    po_number: z.string(),
    total_items: z.number().int(),
    tanggal_order: z.string().datetime(),
    po_type: z.string(),
    statusId: z.string().uuid('Invalid Status UUID'),
    suratJalan: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    suratPO: z.string().optional(),
    suratPenagihan: z.string().optional(),
  }),
});

export const getPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
});

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
  body: z.object({
    customerId: z.string().uuid('Invalid Customer UUID').optional(),
    po_number: z.string().optional(),
    total_items: z.number().int().optional(),
    tanggal_order: z.string().datetime().optional(),
    po_type: z.string().optional(),
    statusId: z.string().uuid('Invalid Status UUID').optional(),
    suratJalan: z.string().optional(),
    invoicePengiriman: z.string().optional(),
    suratPO: z.string().optional(),
    suratPenagihan: z.string().optional(),
  }),
});

export const deletePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>['body'];
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
