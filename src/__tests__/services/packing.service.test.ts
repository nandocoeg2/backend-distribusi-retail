import { PackingService } from '@/services/packing.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

// Mock prisma client
jest.mock('@/config/database', () => ({
  prisma: {
    packing: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    purchaseOrder: {
      findUnique: jest.fn(),
    },
    status: {
      findUnique: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
    },
    packingItem: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('PackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPacking', () => {
    it('should create a packing successfully', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [
          {
            nama_barang: 'Item 1',
            total_qty: 10,
            jumlah_carton: 2,
            isi_per_carton: 5,
            no_box: 'BOX001',
            inventoryId: 'inv1',
          },
        ],
      };

      const mockPurchaseOrder = { id: 'po1', po_number: 'PO-2024-001' };
      const mockStatus = { id: 'status1' };
      const mockInventories = [{ id: 'inv1' }];
      const mockPackingResult = {
        id: 'packing1',
        ...mockPackingData,
        packingItems: mockPackingData.packingItems,
        purchaseOrder: mockPurchaseOrder,
        status: mockStatus,
      };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);
      (prisma.packing.create as jest.Mock).mockResolvedValue(mockPackingResult);

      const result = await PackingService.createPacking(mockPackingData);

      expect(result).toEqual(mockPackingResult);
      expect(prisma.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'po1' },
      });
      expect(prisma.packing.create).toHaveBeenCalledWith({
        data: {
          packing_number: expect.stringMatching(/^PN-\d{8}-PO-2024-001$/), // Base format with specific PO number for first attempt
          tanggal_packing: mockPackingData.tanggal_packing,
          statusId: 'status1',
          purchaseOrderId: 'po1',
          updatedBy: 'user1',
          packingItems: {
            create: mockPackingData.packingItems,
          },
        },
        include: {
          packingItems: {
            include: {
              status: true,
            },
          },
          purchaseOrder: true,
          status: true,
        },
      });
    });

    it('should throw an error if purchase order not found', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [],
      };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(PackingService.createPacking(mockPackingData)).rejects.toThrow(
        new AppError('Purchase Order not found', 404)
      );
    });

    it('should throw an error if packing already exists', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [],
      };

      const mockPurchaseOrder = { id: 'po1', po_number: 'PO-2024-001' };
      const mockExistingPacking = { id: 'existing-packing' };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(mockExistingPacking);

      await expect(PackingService.createPacking(mockPackingData)).rejects.toThrow(
        new AppError('Packing already exists for this Purchase Order', 409)
      );
    });

    it('should throw an error if status not found', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [],
      };

      const mockPurchaseOrder = { id: 'po1', po_number: 'PO-2024-001' };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(PackingService.createPacking(mockPackingData)).rejects.toThrow(
        new AppError('Status not found', 404)
      );
    });

    it('should throw an error if inventory not found', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [
          {
            nama_barang: 'Item 1',
            total_qty: 10,
            jumlah_carton: 2,
            isi_per_carton: 5,
            no_box: 'BOX001',
            inventoryId: 'inv1',
          },
        ],
      };

      const mockPurchaseOrder = { id: 'po1', po_number: 'PO-2024-001' };
      const mockStatus = { id: 'status1' };
      const mockInventories = []; // No inventories found

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);

      await expect(PackingService.createPacking(mockPackingData)).rejects.toThrow(
        new AppError('Inventories not found: inv1', 404)
      );
    });

    it('should use system as default updatedBy', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        packingItems: [],
      };

      const mockPurchaseOrder = { id: 'po1', po_number: 'PO-2024-001' };
      const mockStatus = { id: 'status1' };
      const mockPackingResult = {
        id: 'packing1',
        ...mockPackingData,
        updatedBy: 'test-user-id',
      };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.packing.create as jest.Mock).mockResolvedValue(mockPackingResult);

      await PackingService.createPacking(mockPackingData);

      expect(prisma.packing.create).toHaveBeenCalledWith({
        data: {
          packing_number: expect.stringMatching(/^PN-\d{8}-PO-2024-001$/), // Base format with specific PO number for first attempt
          tanggal_packing: mockPackingData.tanggal_packing,
          statusId: 'status1',
          purchaseOrderId: 'po1',
          updatedBy: 'test-user-id',
          packingItems: {
            create: mockPackingData.packingItems,
          },
        },
        include: {
          packingItems: {
            include: {
              status: true,
            },
          },
          purchaseOrder: true,
          status: true,
        },
      });
    });

    it('should handle general errors', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        packingItems: [],
      };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(PackingService.createPacking(mockPackingData)).rejects.toThrow(
        new AppError('Failed to create packing', 500)
      );
    });
  });

  describe('getAllPackings', () => {
    it('should return paginated packings', async () => {
      const mockPackings = [
        {
          id: 'packing1',
          packing_number: 'PN-20250113-ABCD', // Mock generated packing number
          tanggal_packing: new Date(),
          statusId: 'status1',
          purchaseOrderId: 'po1',
          updatedBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTotalItems = 1;

      (prisma.packing.findMany as jest.Mock).mockResolvedValue(mockPackings);
      (prisma.packing.count as jest.Mock).mockResolvedValue(mockTotalItems);

      const result = await PackingService.getAllPackings(1, 10);

      expect(result).toEqual({
        data: mockPackings,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getPackingById', () => {
    it('should return a packing by id', async () => {
      const mockPacking = {
        id: 'packing1',
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(mockPacking);

      const result = await PackingService.getPackingById('packing1');

      expect(result).toEqual(mockPacking);
      expect(prisma.packing.findUnique).toHaveBeenCalledWith({
        where: { id: 'packing1' },
        include: {
          packingItems: {
            include: {
              status: true,
            },
          },
          purchaseOrder: true,
          status: true,
        },
      });
    });
  });

  describe('updatePacking', () => {
    it('should update packing successfully', async () => {
      const mockUpdateData = {
        packing_number: 'PKG002',
        tanggal_packing: new Date(),
        statusId: 'status2',
        updatedBy: 'user2',
        packingItems: [
          {
            nama_barang: 'Updated Item',
            total_qty: 20,
            jumlah_carton: 4,
            isi_per_carton: 5,
            no_box: 'BOX002',
            inventoryId: 'inv2',
          },
        ],
      };

      const mockExistingPacking = { id: 'packing1' };
      const mockUpdatedPacking = {
        id: 'packing1',
        ...mockUpdateData,
        packingItems: mockUpdateData.packingItems,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          packing: {
            findUnique: jest.fn().mockResolvedValue(mockExistingPacking),
            update: jest.fn().mockResolvedValue(mockUpdatedPacking),
          },
          packingItem: {
            deleteMany: jest.fn().mockResolvedValue({}),
            createMany: jest.fn().mockResolvedValue({}),
          },
        });
      });

      (prisma.$transaction as jest.Mock).mockImplementation(mockTransaction);

      const result = await PackingService.updatePacking('packing1', mockUpdateData);

      expect(result).toEqual(mockUpdatedPacking);
    });

    it('should throw error if packing not found', async () => {
      const mockUpdateData = {
        packing_number: 'PKG002',
        tanggal_packing: new Date(),
        statusId: 'status2',
        updatedBy: 'user2',
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          packing: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      (prisma.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await expect(PackingService.updatePacking('packing1', mockUpdateData)).rejects.toThrow(
        new AppError('Packing not found', 404)
      );
    });

    it('should handle general errors', async () => {
      const mockUpdateData = {
        packing_number: 'PKG002',
        tanggal_packing: new Date(),
        statusId: 'status2',
        updatedBy: 'user2',
      };

      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(PackingService.updatePacking('packing1', mockUpdateData)).rejects.toThrow(
        new AppError('Failed to update packing', 500)
      );
    });
  });

  describe('deletePacking', () => {
    it('should delete packing successfully', async () => {
      const mockDeletedPacking = {
        id: 'packing1',
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
      };

      (prisma.packing.delete as jest.Mock).mockResolvedValue(mockDeletedPacking);

      const result = await PackingService.deletePacking('packing1');

      expect(result).toEqual(mockDeletedPacking);
      expect(prisma.packing.delete).toHaveBeenCalledWith({
        where: { id: 'packing1' },
        include: {
          packingItems: {
            include: {
              status: true,
            },
          },
          purchaseOrder: true,
          status: true,
        },
      });
    });

    it('should return null if packing not found', async () => {
      (prisma.packing.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await PackingService.deletePacking('packing1');

      expect(result).toBeNull();
    });
  });

  describe('searchPackings', () => {
    it('should search packings with filters', async () => {
      const mockQuery = {
        tanggal_packing: '2025-01-15',
        statusId: 'status1',
        purchaseOrderId: 'po1',
        page: 1,
        limit: 10,
      };

      const mockPackings = [
        {
          id: 'packing1',
          tanggal_packing: new Date('2025-01-15'),
          statusId: 'status1',
          purchaseOrderId: 'po1',
        },
      ];

      (prisma.packing.findMany as jest.Mock).mockResolvedValue(mockPackings);
      (prisma.packing.count as jest.Mock).mockResolvedValue(1);

      const result = await PackingService.searchPackings(mockQuery);

      expect(result).toEqual({
        data: mockPackings,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });

    it('should search packings without filters', async () => {
      const mockQuery = {
        page: 1,
        limit: 10,
      };

      const mockPackings = [
        {
          id: 'packing1',
          packing_number: 'PN-20250113-ABCD', // Mock generated packing number
          tanggal_packing: new Date(),
          statusId: 'status1',
          purchaseOrderId: 'po1',
        },
      ];

      (prisma.packing.findMany as jest.Mock).mockResolvedValue(mockPackings);
      (prisma.packing.count as jest.Mock).mockResolvedValue(1);

      const result = await PackingService.searchPackings(mockQuery);

      expect(result).toEqual({
        data: mockPackings,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });

    it('should handle invalid date', async () => {
      const mockQuery = {
        tanggal_packing: 'invalid-date',
        page: 1,
        limit: 10,
      };

      const mockPackings = [];
      (prisma.packing.findMany as jest.Mock).mockResolvedValue(mockPackings);
      (prisma.packing.count as jest.Mock).mockResolvedValue(0);

      const result = await PackingService.searchPackings(mockQuery);

      expect(result).toEqual({
        data: mockPackings,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      });
    });
  });
});
