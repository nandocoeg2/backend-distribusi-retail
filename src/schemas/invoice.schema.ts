import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createInvoiceSchema = z.object({
  body: z.object({
    no_invoice: z.string().describe('Invoice number'),
    tanggal: z.string().optional().describe('Date of the invoice'),
    deliver_to: z.string().describe('Delivery address'),
    sub_total: z.number().describe('Subtotal amount'),
    total_discount: z.number().describe('Total discount amount'),
    total_price: z.number().describe('Total price after discount'),
    ppn_percentage: z.number().describe('VAT percentage'),
    ppn_rupiah: z.number().describe('VAT amount in Rupiah'),
    grand_total: z.number().describe('Grand total amount'),
    expired_date: z.string().optional().describe('Expiration date of the invoice'),
    TOP: z.string().optional().describe('Term of payment'),
    type: z.enum(['PEMBAYARAN', 'PENGIRIMAN']).optional().describe('Type of invoice'),
    statusPembayaranId: z.string().optional().describe('Payment status ID'),
    purchaseOrderId: z.string().optional().describe('Purchase Order ID'),
    createdBy: z.string().optional().describe('User who created the invoice'),
    updatedBy: z.string().optional().describe('User who updated the invoice'),
    invoiceDetails: z.array(z.object({
      nama_barang: z.string().describe('Name of the item'),
      PLU: z.string().describe('Price Look-Up code'),
      quantity: z.number().int().describe('Quantity of the item'),
      satuan: z.string().describe('Unit of the item'),
      harga: z.number().describe('Price of the item'),
      total: z.number().describe('Total price for the item'),
      discount_percentage: z.number().describe('Discount percentage for the item'),
      discount_rupiah: z.number().describe('Discount amount in Rupiah for the item'),
      PPN_pecentage: z.number().describe('VAT percentage for the item'),
      ppn_rupiah: z.number().describe('VAT amount in Rupiah for the item'),
    })).optional().describe('Details of the invoice'),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice'),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice'),
  }),
  body: z.object({
    no_invoice: z.string().optional().describe('Invoice number'),
    tanggal: z.string().optional().describe('Date of the invoice'),
    deliver_to: z.string().optional().describe('Delivery address'),
    sub_total: z.number().optional().describe('Subtotal amount'),
    total_discount: z.number().optional().describe('Total discount amount'),
    total_price: z.number().optional().describe('Total price after discount'),
    ppn_percentage: z.number().optional().describe('VAT percentage'),
    ppn_rupiah: z.number().optional().describe('VAT amount in Rupiah'),
    grand_total: z.number().optional().describe('Grand total amount'),
    expired_date: z.string().optional().describe('Expiration date of the invoice'),
    TOP: z.string().optional().describe('Term of payment'),
    type: z.enum(['PEMBAYARAN', 'PENGIRIMAN']).optional().describe('Type of invoice'),
    statusPembayaranId: z.string().optional().describe('Payment status ID'),
    purchaseOrderId: z.string().optional().describe('Purchase Order ID'),
    updatedBy: z.string().optional().describe('User who updated the invoice'),
    invoiceDetails: z.array(z.object({
      id: z.string().optional().describe('The ID of the invoice detail'),
      nama_barang: z.string().describe('Name of the item'),
      PLU: z.string().describe('Price Look-Up code'),
      quantity: z.number().int().describe('Quantity of the item'),
      satuan: z.string().describe('Unit of the item'),
      harga: z.number().describe('Price of the item'),
      total: z.number().describe('Total price for the item'),
      discount_percentage: z.number().describe('Discount percentage for the item'),
      discount_rupiah: z.number().describe('Discount amount in Rupiah for the item'),
      PPN_pecentage: z.number().describe('VAT percentage for the item'),
      ppn_rupiah: z.number().describe('VAT amount in Rupiah for the item'),
    })).optional().describe('Details of the invoice'),
  }),
});

export const deleteInvoiceSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the invoice'),
  }),
});

export const searchInvoiceSchema = z.object({
  query: z.object({
    no_invoice: z.string().optional().describe('Search by invoice number'),
    deliver_to: z.string().optional().describe('Search by delivery address'),
    type: z.string().optional().describe('Search by invoice type'),
    statusPembayaranId: z.string().optional().describe('Search by payment status ID'),
    purchaseOrderId: z.string().optional().describe('Search by Purchase Order ID'),
    tanggal_start: z.string().optional().describe('Search by start date'),
    tanggal_end: z.string().optional().describe('Search by end date'),
  }).merge(paginationSchema),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type SearchInvoiceInput = z.infer<typeof searchInvoiceSchema>;
export type InvoicePaginationInput = z.infer<typeof paginationSchema>;
