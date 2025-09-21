import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createLaporanBenerimaanBarangSchema = z.object({
  body: z.object({
    purchaseOrderId: z.string({ required_error: 'Purchase Order ID is required' }).describe('The ID of the related purchase order'),
    tanggal_po: z.coerce.date().optional().describe('The purchase order date'),
    customerId: z.string({ required_error: 'Customer ID is required' }).describe('The ID of the related customer'),
    alamat_customer: z.string().optional().describe('Customer address'),
    termin_bayar: z.string().optional().describe('The ID of the payment term'),
    file_path: z.string().optional().describe('Path to the uploaded document'),
  }),
});

export const getLaporanBenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
});

export const updateLaporanBenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
  body: z.object({
    purchaseOrderId: z.string().optional().describe('The ID of the related purchase order'),
    tanggal_po: z.coerce.date().optional().describe('The purchase order date'),
    customerId: z.string().optional().describe('The ID of the related customer'),
    alamat_customer: z.string().optional().describe('Customer address'),
    termin_bayar: z.string().optional().describe('The ID of the payment term'),
    file_path: z.string().optional().describe('Path to the uploaded document'),
  }),
});

export const deleteLaporanBenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
});

export const getAllLaporanBenerimaanBarangSchema = z.object({
  query: paginationSchema,
});

export const searchLaporanBenerimaanBarangSchema = z.object({
  query: z
    .object({
      q: z.string().optional().describe('Search keyword'),
    })
    .merge(paginationSchema),
});

export type CreateLaporanBenerimaanBarangInput = z.infer<typeof createLaporanBenerimaanBarangSchema>['body'];
export type UpdateLaporanBenerimaanBarangInput = z.infer<typeof updateLaporanBenerimaanBarangSchema>;
export type GetAllLaporanBenerimaanBarangInput = z.infer<typeof getAllLaporanBenerimaanBarangSchema>;
export type SearchLaporanBenerimaanBarangInput = z.infer<typeof searchLaporanBenerimaanBarangSchema>;
