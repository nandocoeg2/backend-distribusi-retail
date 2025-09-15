import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createInvoiceSchema = z.object({
  body: z.object({
    no_invoice: z.string(),
    tanggal: z.string().optional(),
    deliver_to: z.string(),
    sub_total: z.number(),
    total_discount: z.number(),
    total_price: z.number(),
    ppn_percentage: z.number(),
    ppn_rupiah: z.number(),
    grand_total: z.number(),
    expired_date: z.string().optional(),
    TOP: z.string().optional(),
    type: z.enum(['PEMBAYARAN', 'PENGIRIMAN']).optional(),
    statusPembayaranId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
    invoiceDetails: z.array(z.object({
      nama_barang: z.string(),
      PLU: z.string(),
      quantity: z.number().int(),
      satuan: z.string(),
      harga: z.number(),
      total: z.number(),
      discount_percentage: z.number(),
      discount_rupiah: z.number(),
      PPN_pecentage: z.number(),
      ppn_rupiah: z.number(),
    })).optional(),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    no_invoice: z.string().optional(),
    tanggal: z.string().optional(),
    deliver_to: z.string().optional(),
    sub_total: z.number().optional(),
    total_discount: z.number().optional(),
    total_price: z.number().optional(),
    ppn_percentage: z.number().optional(),
    ppn_rupiah: z.number().optional(),
    grand_total: z.number().optional(),
    expired_date: z.string().optional(),
    TOP: z.string().optional(),
    type: z.enum(['PEMBAYARAN', 'PENGIRIMAN']).optional(),
    statusPembayaranId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    updatedBy: z.string().optional(),
    invoiceDetails: z.array(z.object({
      id: z.string().optional(),
      nama_barang: z.string(),
      PLU: z.string(),
      quantity: z.number().int(),
      satuan: z.string(),
      harga: z.number(),
      total: z.number(),
      discount_percentage: z.number(),
      discount_rupiah: z.number(),
      PPN_pecentage: z.number(),
      ppn_rupiah: z.number(),
    })).optional(),
  }),
});

export const deleteInvoiceSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchInvoiceSchema = z.object({
  query: z.object({
    no_invoice: z.string().optional(),
    deliver_to: z.string().optional(),
    type: z.string().optional(),
    statusPembayaranId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    tanggal_start: z.string().optional(),
    tanggal_end: z.string().optional(),
  }).merge(paginationSchema),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type SearchInvoiceInput = z.infer<typeof searchInvoiceSchema>;
export type InvoicePaginationInput = z.infer<typeof paginationSchema>;
