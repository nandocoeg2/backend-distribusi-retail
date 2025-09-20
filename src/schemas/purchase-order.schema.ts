import { z } from 'zod';
import { POType } from '@prisma/client';
import { paginationSchema } from './pagination.schema';

const purchaseOrderDetailSchema = z.object({
  id: z.string().optional().describe('The ID of the purchase order detail'),
  plu: z.string().describe('Price Look-Up code'),
  nama_barang: z.string().describe('Name of the item'),
  quantity: z.coerce.number().int().describe('Quantity of the item'),
  isi: z.coerce.number().int().describe('Content of the item'),
  harga: z.coerce.number().describe('Price of the item'),
  potongan_a: z.coerce.number().nullable().optional().describe('Discount A'),
  harga_after_potongan_a: z.coerce.number().nullable().optional().describe('Price after discount A'),
  harga_netto: z.coerce.number().describe('Net price'),
  total_pembelian: z.coerce.number().describe('Total purchase price'),
  potongan_b: z.coerce.number().nullable().optional().describe('Discount B'),
  harga_after_potongan_b: z.coerce.number().nullable().optional().describe('Price after discount B'),
  inventoryId: z.string().optional().describe('The ID of the inventory item'),
});

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    customerId: z.string().describe('The ID of the customer'),
    po_number: z.string().describe('The purchase order number'),
    total_items: z.coerce.number().int().optional().describe('Total number of items in the PO'),
    tanggal_masuk_po: z.coerce.date().optional().describe('The date when PO was received'),
    tanggal_batas_kirim: z.coerce.date().optional().describe('The delivery deadline date'),
    termin_bayar: z.string().optional().describe('Payment terms'),
    po_type: z.nativeEnum(POType).describe('The type of the purchase order'),
    status_code: z.string().optional().describe('The status code of the purchase order'),
    purchaseOrderDetails: z.array(purchaseOrderDetailSchema).optional().describe('The details of the purchase order'),
  }),
});

export const getPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
});

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
  body: z.object({
    customerId: z.string().optional().describe('The ID of the customer'),
    po_number: z.string().optional().describe('The purchase order number'),
    total_items: z.number().int().optional().describe('Total number of items in the PO'),
    tanggal_masuk_po: z.coerce.date().optional().describe('The date when PO was received'),
    tanggal_batas_kirim: z.coerce.date().optional().describe('The delivery deadline date'),
    termin_bayar: z.string().optional().describe('Payment terms'),
    po_type: z.nativeEnum(POType).optional().describe('The type of the purchase order'),
    status_code: z.string().optional().describe('The status code of the purchase order'),
    purchaseOrderDetails: z.array(purchaseOrderDetailSchema).optional().describe('The details of the purchase order'),
  }),
});

export const deletePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
});

export const searchPurchaseOrderSchema = z.object({
  query: z.object({
    tanggal_masuk_po: z.string().optional().describe('Search by PO received date'),
    customer_name: z.string().optional().describe('Search by customer name'),
    customerId: z.string().optional().describe('Search by customer ID'),
    po_number: z.string().optional().describe('Search by PO number'),
    supplierId: z.string().optional().describe('Search by supplier ID'),
    status_code: z.string().optional().describe('Search by status code'),
  }).merge(paginationSchema),
});

export const processPurchaseOrderSchema = z.object({
  body: z.object({
    status_code: z.string().describe('The status code to process the purchase order(s)'),
    ids: z.array(z.string()).min(1).describe('Array of purchase order IDs to process'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});


export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>['body'];
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type SearchPurchaseOrderInput = z.infer<typeof searchPurchaseOrderSchema>;
export type HistoryPurchaseOrderInput = z.infer<typeof paginationSchema>;
export type ProcessPurchaseOrderInput = z.infer<typeof processPurchaseOrderSchema>;

