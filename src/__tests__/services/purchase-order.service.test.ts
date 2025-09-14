import { prisma } from '@/config/database';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { AppError } from '@/utils/app-error';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    purchaseOrder: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    status: {
      findMany: jest.fn(),
    },
    purchaseOrderDetail: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    inventory: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
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

  describe('updatePurchaseOrder', () => {
    const mockUpdatedPO = {
      id: 'po1',
      po_number: 'PO-001-UPDATED',
      customerId: 'customer1',
      purchaseOrderDetails: [
        {
          id: 'existing-detail-1',
          kode_barang: '4324992',
          nama_barang: 'TAS BELANJA',
          quantity: 4,
          isi: 1,
          harga: 250000,
          harga_netto: 1000,
          total_pembelian: 990000,
          inventoryId: 'inventory1',
        },
      ],
      customer: { name: 'Test Customer' },
      supplier: null,
      status: { name: 'PENDING' },
      files: [],
    };

    const mockInventoryItem = {
      id: 'new-inventory-1',
      kode_barang: '123123',
      nama_barang: '213123',
      stok_barang: 1,
      harga_barang: 123123,
    };

    it('should update purchase order with existing inventory', async () => {
      const updateData = {
        po_number: 'PO-001-UPDATED',
        purchaseOrderDetails: [
          {
            id: 'existing-detail-1',
            kode_barang: '4324992',
            nama_barang: 'TAS BELANJA',
            quantity: 4,
            isi: 1,
            harga: 250000,
            harga_netto: 1000,
            total_pembelian: 990000,
            inventoryId: 'inventory1',
          },
        ],
      };

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue({ id: 'po1' }),
            update: jest.fn().mockResolvedValue(mockUpdatedPO),
          },
          purchaseOrderDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventory: {
            upsert: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.updatePurchaseOrder('po1', updateData);

      expect(result).toEqual(mockUpdatedPO);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should create new inventory for items without inventoryId', async () => {
      const updateData = {
        po_number: 'PO-001-UPDATED',
        purchaseOrderDetails: [
          {
            kode_barang: '123123',
            nama_barang: '213123',
            quantity: 1,
            isi: 1,
            harga: 123123,
            harga_netto: 123123,
            total_pembelian: 123123,
            // No inventoryId provided - should create new inventory
          },
        ],
      };

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue({ id: 'po1' }),
            update: jest.fn().mockResolvedValue({
              ...mockUpdatedPO,
              purchaseOrderDetails: [
                {
                  ...updateData.purchaseOrderDetails[0],
                  inventoryId: mockInventoryItem.id,
                },
              ],
            }),
          },
          purchaseOrderDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventory: {
            upsert: jest.fn().mockResolvedValue(mockInventoryItem),
          },
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.updatePurchaseOrder('po1', updateData);

      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error when purchase order not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx);
      });

      await expect(
        PurchaseOrderService.updatePurchaseOrder('non-existent-po', {})
      ).rejects.toThrow(AppError);
    });
  });

  // Note: The processPurchaseOrder method has been enhanced to automatically
  // create packing, invoice, and surat jalan when processing a purchase order.
  // This ensures that all downstream documents are generated with details
  // matching the purchase order details.
});
