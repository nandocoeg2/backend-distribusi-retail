import { z } from 'zod';
import { POType } from '@prisma/client';
import { paginationSchema } from './pagination.schema';

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    customerId: z.string().describe('The ID of the customer'),
    po_number: z.string().describe('The purchase order number'),
    total_items: z.coerce.number().int().optional().describe('Total number of items in the PO'),
    tanggal_order: z.coerce.date().optional().describe('The date of the order'),
    po_type: z.nativeEnum(POType).describe('The type of the purchase order'),
    statusId: z.string().optional().describe('The ID of the status'),
    suratJalan: z.string().optional().describe('Delivery order document'),
    invoicePengiriman: z.string().optional().describe('Shipping invoice document'),
    suratPO: z.string().optional().describe('Purchase order document'),
    suratPenagihan: z.string().optional().describe('Billing document'),
  }),
});

export const getPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
});

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

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
  body: z.object({
    customerId: z.string().optional().describe('The ID of the customer'),
    po_number: z.string().optional().describe('The purchase order number'),
    total_items: z.number().int().optional().describe('Total number of items in the PO'),
    tanggal_order: z.coerce.date().optional().describe('The date of the order'),
    po_type: z.nativeEnum(POType).optional().describe('The type of the purchase order'),
    statusId: z.string().optional().describe('The ID of the status'),
    suratJalan: z.string().optional().describe('Delivery order document'),
    invoicePengiriman: z.string().optional().describe('Shipping invoice document'),
    suratPO: z.string().optional().describe('Purchase order document'),
    suratPenagihan: z.string().optional().describe('Billing document'),
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
    tanggal_order: z.string().optional().describe('Search by order date'),
    customer_name: z.string().optional().describe('Search by customer name'),
    customerId: z.string().optional().describe('Search by customer ID'),
    suratPO: z.string().optional().describe('Search by PO document'),
    invoicePengiriman: z.string().optional().describe('Search by shipping invoice'),
    po_number: z.string().optional().describe('Search by PO number'),
    supplierId: z.string().optional().describe('Search by supplier ID'),
    statusId: z.string().optional().describe('Search by status ID'),
  }).merge(paginationSchema),
});

export const processPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the purchase order'),
  }),
  body: z.object({
    status_code: z.string().describe('The status code to process the purchase order'),
  }),
});


export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>['body'];
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type SearchPurchaseOrderInput = z.infer<typeof searchPurchaseOrderSchema>;
export type HistoryPurchaseOrderInput = z.infer<typeof paginationSchema>;
export type ProcessPurchaseOrderInput = z.infer<typeof processPurchaseOrderSchema>;

