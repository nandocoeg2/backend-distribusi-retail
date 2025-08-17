import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer UUID'),
    orderNumber: z.string(),
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
    orderNumber: z.string().optional(),
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
