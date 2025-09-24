import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createInvoicePenagihanSchema = z.object({
  body: z.object({
    purchaseOrderId: z.string().describe('Purchase Order ID'),
    kw: z.boolean().optional().describe('KW status'),
    fp: z.boolean().optional().describe('FP status'),
    tanggal: z.string().optional().describe('Date of the invoice penagihan'),
    kepada: z.string().describe('Recipient name'),
    sub_total: z.number().describe('Subtotal amount'),
    total_discount: z.number().describe('Total discount amount'),
    total_price: z.number().describe('Total price after discount'),
    ppn_percentage: z.number().describe('VAT percentage'),
    ppn_rupiah: z.number().describe('VAT amount in Rupiah'),
    grand_total: z.number().describe('Grand total amount'),
    termOfPaymentId: z.string().describe('Term of payment ID'),
    statusId: z.string().describe('Status ID'),
    invoicePenagihanDetails: z
      .array(
        z.object({
          nama_barang: z.string().describe('Name of the item'),
          PLU: z.string().describe('Price Look-Up code'),
          quantity: z.number().int().describe('Quantity of the item'),
          satuan: z.string().describe('Unit of the item'),
          harga: z.number().describe('Price of the item'),
          total: z.number().describe('Total price for the item'),
          discount_percentage: z.number().describe('Discount percentage for the item'),
          discount_rupiah: z.number().describe('Discount amount in Rupiah for the item'),
        })
      )
      .optional()
      .describe('Details of the invoice penagihan'),
  }),
});

export const getInvoicePenagihanSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice penagihan'),
  }),
});

export const updateInvoicePenagihanSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice penagihan'),
  }),
  body: z.object({
    purchaseOrderId: z.string().optional().describe('Purchase Order ID'),
    kw: z.boolean().optional().describe('KW status'),
    fp: z.boolean().optional().describe('FP status'),
    tanggal: z.string().optional().describe('Date of the invoice penagihan'),
    kepada: z.string().optional().describe('Recipient name'),
    sub_total: z.number().optional().describe('Subtotal amount'),
    total_discount: z.number().optional().describe('Total discount amount'),
    total_price: z.number().optional().describe('Total price after discount'),
    ppn_percentage: z.number().optional().describe('VAT percentage'),
    ppn_rupiah: z.number().optional().describe('VAT amount in Rupiah'),
    grand_total: z.number().optional().describe('Grand total amount'),
    termOfPaymentId: z.string().optional().describe('Term of payment ID'),
    statusId: z.string().optional().describe('Status ID'),
    invoicePenagihanDetails: z
      .array(
        z.object({
          id: z.string().optional().describe('The ID of the invoice detail'),
          nama_barang: z.string().describe('Name of the item'),
          PLU: z.string().describe('Price Look-Up code'),
          quantity: z.number().int().describe('Quantity of the item'),
          satuan: z.string().describe('Unit of the item'),
          harga: z.number().describe('Price of the item'),
          total: z.number().describe('Total price for the item'),
          discount_percentage: z.number().describe('Discount percentage for the item'),
          discount_rupiah: z.number().describe('Discount amount in Rupiah for the item'),
        })
      )
      .optional()
      .describe('Details of the invoice penagihan'),
  }),
});

export const deleteInvoicePenagihanSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice penagihan'),
  }),
});

export const searchInvoicePenagihanSchema = z.object({
  query: z
    .object({
      no_invoice_penagihan: z.string().optional().describe('Search by invoice number'),
      kepada: z.string().optional().describe('Search by recipient name'),
      statusId: z.string().optional().describe('Search by status ID'),
      purchaseOrderId: z.string().optional().describe('Search by Purchase Order ID'),
      termOfPaymentId: z.string().optional().describe('Search by Term of Payment ID'),
      kw: z.boolean().optional().describe('Search by KW status'),
      fp: z.boolean().optional().describe('Search by FP status'),
      tanggal_start: z.string().optional().describe('Search by start date'),
      tanggal_end: z.string().optional().describe('Search by end date'),
    })
    .merge(paginationSchema),
});

export type CreateInvoicePenagihanInput = z.infer<typeof createInvoicePenagihanSchema>['body'];
export type UpdateInvoicePenagihanInput = z.infer<typeof updateInvoicePenagihanSchema>;
export type SearchInvoicePenagihanInput = z.infer<typeof searchInvoicePenagihanSchema>;
export type InvoicePenagihanPaginationInput = z.infer<typeof paginationSchema>;
