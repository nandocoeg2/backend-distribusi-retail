import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createTermOfPaymentSchema = z.object({
  body: z.object({
    kode_top: z.string({ required_error: 'TOP code is required' }),
    batas_hari: z.number({ required_error: 'Day limit is required' }).int().positive(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getTermOfPaymentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateTermOfPaymentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    kode_top: z.string().optional(),
    batas_hari: z.number().int().positive().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteTermOfPaymentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchTermOfPaymentSchema = z.object({
  params: z.object({
    q: z.string().optional(),
  }),
  query: paginationSchema,
});

export const getAllTermOfPaymentsSchema = z.object({
  query: paginationSchema,
});

export type CreateTermOfPaymentInput = z.infer<typeof createTermOfPaymentSchema>['body'];
export type UpdateTermOfPaymentInput = z.infer<typeof updateTermOfPaymentSchema>;
export type SearchTermOfPaymentInput = z.infer<typeof searchTermOfPaymentSchema>;
export type GetAllTermOfPaymentsInput = z.infer<typeof getAllTermOfPaymentsSchema>;

