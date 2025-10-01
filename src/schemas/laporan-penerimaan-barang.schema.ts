import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createLaporanPenerimaanBarangSchema = z.object({
  body: z.object({
    purchaseOrderId: z.string({ required_error: 'Purchase Order ID is required' }).describe('The ID of the related purchase order'),
    tanggal_po: z.coerce.date().optional().describe('The purchase order date'),
    customerId: z.string({ required_error: 'Customer ID is required' }).describe('The ID of the related customer'),
    termin_bayar: z.string().optional().describe('The ID of the payment term'),
    statusId: z.string().optional().describe('The ID of the status'),
    files: z.array(z.string()).optional().describe('List of uploaded file IDs associated with the report'),
  }),
});

export const getLaporanPenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
});

export const updateLaporanPenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
  body: z.object({
    purchaseOrderId: z.string().optional().describe('The ID of the related purchase order'),
    tanggal_po: z.coerce.date().optional().describe('The purchase order date'),
    customerId: z.string().optional().describe('The ID of the related customer'),
    termin_bayar: z.string().optional().describe('The ID of the payment term'),
    statusId: z.string().optional().describe('The ID of the status'),
    files: z.array(z.string()).optional().describe('List of uploaded file IDs associated with the report'),
  }),
});

export const deleteLaporanPenerimaanBarangSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the goods receipt report'),
  }),
});

export const getAllLaporanPenerimaanBarangSchema = z.object({
  query: paginationSchema,
});

export const searchLaporanPenerimaanBarangSchema = z.object({
  query: z
    .object({
      q: z.string().optional().describe('Search keyword'),
    })
    .merge(paginationSchema),
});

export const processLaporanPenerimaanBarangSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).describe('Array of goods receipt report IDs to process'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const completeLaporanPenerimaanBarangSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).describe('Array of goods receipt report IDs to mark as completed'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
export const getBulkStatusSchema = z.object({
  params: z.object({
    bulkId: z.string().describe('The bulk ID of the upload job'),
  }),
});

export const getBulkFilesSchema = z.object({
  query: z.object({
    status: z.enum([
      'processed', 
      'pending',
      'PENDING BULK LAPORAN PENERIMAAN BARANG',
      'PROCESSING BULK LAPORAN PENERIMAAN BARANG', 
      'COMPLETED BULK LAPORAN PENERIMAAN BARANG',
      'FAILED BULK LAPORAN PENERIMAAN BARANG'
    ]).optional().describe('Filter by bulk upload status'),
  }),
});

export const uploadFileLaporanPenerimaanBarangSchema = z.object({
  body: z.object({
    prompt: z.string().optional().describe('Custom prompt for file conversion'),
  }).optional(),
});

export type CreateLaporanPenerimaanBarangInput = z.infer<typeof createLaporanPenerimaanBarangSchema>['body'];
export type UpdateLaporanPenerimaanBarangInput = z.infer<typeof updateLaporanPenerimaanBarangSchema>;
export type GetAllLaporanPenerimaanBarangInput = z.infer<typeof getAllLaporanPenerimaanBarangSchema>;
export type SearchLaporanPenerimaanBarangInput = z.infer<typeof searchLaporanPenerimaanBarangSchema>;
export type UploadFileLaporanPenerimaanBarangInput = z.infer<typeof uploadFileLaporanPenerimaanBarangSchema>;
export type ProcessLaporanPenerimaanBarangInput = z.infer<typeof processLaporanPenerimaanBarangSchema>;
export type CompleteLaporanPenerimaanBarangInput = z.infer<typeof completeLaporanPenerimaanBarangSchema>;
export type GetBulkStatusInput = z.infer<typeof getBulkStatusSchema>;
export type GetBulkFilesInput = z.infer<typeof getBulkFilesSchema>;

