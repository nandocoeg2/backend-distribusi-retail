import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/config/database';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { SearchPurchaseOrderInput } from '@/schemas/purchase-order.schema';

describe('PurchaseOrderService', () => {
  const mockPurchaseOrders = [
    {
      id: '1',
      tanggal_order: new Date('2025-01-15'),
      customerId: 'cust1',
      customer: { name: 'Customer A' },
      suratPO: 'PO-001',
      invoicePengiriman: 'INV-001',
      po_number: 'PO-NUM-001',
      supplierId: 'supp1',
      statusId: 'status1',
    },
    {
      id: '2',
      tanggal_order: new Date('2025-01-16'),
      customerId: 'cust2',
      customer: { name: 'Customer B' },
      suratPO: 'PO-002',
      invoicePengiriman: 'INV-002',
      po_number: 'PO-NUM-002',
      supplierId: 'supp2',
      statusId: 'status2',
    },
  ];

  beforeEach(() => {
    vi.spyOn(prisma.purchaseOrder, 'findMany').mockResolvedValue(mockPurchaseOrders as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchPurchaseOrders', () => {
    it('should return all purchase orders if no query is provided', async () => {
      const query: SearchPurchaseOrderInput['query'] = {};
      const result = await PurchaseOrderService.searchPurchaseOrders(query);
      expect(result).toEqual(mockPurchaseOrders);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          AND: [],
        },
        include: {
          customer: true,
          supplier: true,
          files: true,
          status: true,
        },
      });
    });

    it('should filter by customer_name', async () => {
      const query: SearchPurchaseOrderInput['query'] = { customer_name: 'Customer A' };
      await PurchaseOrderService.searchPurchaseOrders(query);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { customer: { name: { contains: 'Customer A', mode: 'insensitive' } } },
          ]),
        },
      }));
    });

    it('should filter by tanggal_order', async () => {
      const query: SearchPurchaseOrderInput['query'] = { tanggal_order: '2025-01-15' };
      await PurchaseOrderService.searchPurchaseOrders(query);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { tanggal_order: new Date('2025-01-15') },
          ]),
        },
      }));
    });
  });
});

