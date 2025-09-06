import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/config/database';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { SearchPurchaseOrderInput } from '@/schemas/purchase-order.schema';

describe('PurchaseOrderService', () => {
  const mockPaginatedResult = {
    data: [
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
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      itemsPerPage: 10,
    }
  };

  beforeEach(() => {
    vi.spyOn(prisma.purchaseOrder, 'findMany').mockResolvedValue(mockPaginatedResult.data as any);
    vi.spyOn(prisma.purchaseOrder, 'count').mockResolvedValue(mockPaginatedResult.pagination.totalItems);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHistoryPurchaseOrders', () => {
    it('should return purchase orders with APPROVED and FAILED status', async () => {
      const mockApprovedStatus = { id: 'approved-status-id' };
      const mockFailedStatus = { id: 'failed-status-id' };
      
      const mockHistoryResult = {
        data: [
          {
            id: '1',
            tanggal_order: new Date('2025-01-15'),
            customerId: 'cust1',
            customer: { name: 'Customer A' },
            suratPO: 'PO-001',
            invoicePengiriman: 'INV-001',
            po_number: 'PO-NUM-001',
            supplierId: 'supp1',
            statusId: 'approved-status-id',
            updatedAt: new Date('2025-01-16'),
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
            statusId: 'failed-status-id',
            updatedAt: new Date('2025-01-17'),
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        }
      };

      // Mock the status lookups
      vi.spyOn(prisma.status, 'findUnique')
        .mockResolvedValueOnce(mockApprovedStatus as any)
        .mockResolvedValueOnce(mockFailedStatus as any);

      // Mock the purchase order queries
      vi.spyOn(prisma.purchaseOrder, 'findMany').mockResolvedValue(mockHistoryResult.data as any);
      vi.spyOn(prisma.purchaseOrder, 'count').mockResolvedValue(mockHistoryResult.pagination.totalItems);

      const result = await PurchaseOrderService.getHistoryPurchaseOrders(1, 10);
      
      expect(result).toEqual(mockHistoryResult);
      expect(prisma.status.findUnique).toHaveBeenCalledWith({ where: { status_code: 'APPROVED PURCHASE ORDER' } });
      expect(prisma.status.findUnique).toHaveBeenCalledWith({ where: { status_code: 'FAILED PURCHASE ORDER' } });
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          statusId: {
            in: ['approved-status-id', 'failed-status-id'],
          },
        },
        skip: 0,
        take: 10,
        include: {
          customer: true,
          supplier: true,
          files: true,
          status: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });

  describe('searchPurchaseOrders', () => {
    it('should return all purchase orders if no query is provided', async () => {
      const query: SearchPurchaseOrderInput['query'] = { page: 1, limit: 10 };
      const result = await PurchaseOrderService.searchPurchaseOrders(query);
      expect(result).toEqual(mockPaginatedResult);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          AND: [],
        },
        skip: 0,
        take: 10,
        include: {
          customer: true,
          supplier: true,
          files: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by customer_name', async () => {
      const query: SearchPurchaseOrderInput['query'] = { customer_name: 'Customer A', page: 1, limit: 10 };
      await PurchaseOrderService.searchPurchaseOrders(query);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { customer: { name: { contains: 'Customer A', mode: 'insensitive' } } },
          ]),
        },
        skip: 0,
        take: 10,
      }));
    });

    it('should filter by tanggal_order', async () => {
      const query: SearchPurchaseOrderInput['query'] = { tanggal_order: '2025-01-15', page: 1, limit: 10 };
      await PurchaseOrderService.searchPurchaseOrders(query);
      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { tanggal_order: new Date('2025-01-15') },
          ]),
        },
        skip: 0,
        take: 10,
      }));
    });
  });
});
