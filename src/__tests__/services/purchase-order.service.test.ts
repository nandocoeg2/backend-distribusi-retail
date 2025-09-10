import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { prisma } from '@/config/database';
import { PurchaseOrderService } from '@/services/purchase-order.service';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    purchaseOrder: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    status: {
      findMany: jest.fn(),
    },
  },
}));

describe('PurchaseOrderService', () => {
  const mockPaginatedResult = {
    data: [
      {
        id: 'po1',
        po_number: 'PO-001',
        customer: { name: 'Test Customer' },
        supplier: { name: 'Test Supplier' },
        status: { name: 'PENDING' },
        tanggal_order: new Date(),
        files: [],
        purchaseOrderDetails: [],
        packings: [],
      },
    ],
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    jest.spyOn(prisma.status, 'findMany').mockResolvedValue([
      { id: 'status1', status_code: 'PENDING PURCHASE ORDER' },
      { id: 'status2', status_code: 'PROCESSED PURCHASE ORDER' },
      { id: 'status3', status_code: 'PROCESSING PURCHASE ORDER' },
    ] as any);
    jest.spyOn(prisma.purchaseOrder, 'findMany').mockResolvedValue(mockPaginatedResult.data as any);
    jest.spyOn(prisma.purchaseOrder, 'count').mockResolvedValue(mockPaginatedResult.pagination.totalItems);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllPurchaseOrders', () => {
    it('should return paginated purchase orders', async () => {
      const result = await PurchaseOrderService.getAllPurchaseOrders(1, 10);

      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
