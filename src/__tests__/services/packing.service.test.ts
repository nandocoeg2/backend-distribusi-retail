import { PackingService } from '@/services/packing.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from '@/services/audit.service';

// Mock audit service
jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

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
      updateMany: jest.fn(),
    },
    auditTrail: {
      findMany: jest.fn(),
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

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(
        mockPurchaseOrder
      );
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(
        mockInventories
      );
      (prisma.packing.create as jest.Mock).mockResolvedValue(mockPackingResult);

      const result = await PackingService.createPacking(
        mockPackingData,
        'user123'
      );

      expect(result).toEqual(mockPackingResult);
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
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue([]);

      const result = await PackingService.getPackingById('packing1');

      expect(result).toEqual({ ...mockPacking, auditTrails: [] });
    });

    it('should throw an error if packing not found', async () => {
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(PackingService.getPackingById('packing1')).rejects.toThrow(
        new AppError('Packing not found', 404)
      );
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

      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(
        mockExistingPacking
      );
      (prisma.packing.update as jest.Mock).mockResolvedValue(
        mockUpdatedPacking
      );
      (prisma.packingItem.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.packingItem.createMany as jest.Mock).mockResolvedValue({});

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback(prisma);
        }
      );

      const result = await PackingService.updatePacking(
        'packing1',
        mockUpdateData,
        'user123'
      );

      expect(result).toEqual(mockUpdatedPacking);
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
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(
        mockDeletedPacking
      );
      (prisma.packing.delete as jest.Mock).mockResolvedValue(
        mockDeletedPacking
      );

      const result = await PackingService.deletePacking('packing1', 'user123');

      expect(result).toEqual(mockDeletedPacking);
    });

    it('should return null if packing not found', async () => {
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await PackingService.deletePacking('packing1', 'user123');

      expect(result).toBeNull();
    });
  });

  describe('processPacking', () => {
    it('should process multiple packings successfully', async () => {
      const userId = 'user123';
      const packingIds = ['packing1', 'packing2'];

      const mockPurchaseOrder = {
        id: 'po1',
        statusId: 'processingPOStatusId',
        status: {
          id: 'processingPOStatusId',
          status_code: 'PROCESSING PURCHASE ORDER',
        },
      };

      const mockPackings = [
        {
          id: 'packing1',
          packing_number: 'PKG-001',
          statusId: 'pendingPackingStatusId',
          purchaseOrderId: 'po1',
          packingItems: [{ id: 'item1' }],
          status: {
            id: 'pendingPackingStatusId',
            status_code: 'PENDING PACKING',
          },
          purchaseOrder: mockPurchaseOrder,
        },
        {
          id: 'packing2',
          packing_number: 'PKG-002',
          statusId: 'pendingPackingStatusId',
          purchaseOrderId: 'po1',
          packingItems: [{ id: 'item2' }],
          status: {
            id: 'pendingPackingStatusId',
            status_code: 'PENDING PACKING',
          },
          purchaseOrder: mockPurchaseOrder,
        },
      ];

      const mockUpdatedPackings = mockPackings.map((packing) => ({
        ...packing,
        statusId: 'processingPackingStatusId',
        status: {
          id: 'processingPackingStatusId',
          status_code: 'PROCESSING PACKING',
        },
        packingItems: packing.packingItems.map((item) => ({
          ...item,
          statusId: 'processingItemStatusId',
          status: {
            id: 'processingItemStatusId',
            status_code: 'PROCESSING ITEM',
          },
        })),
      }));

      (prisma.packing.findMany as jest.Mock)
        .mockResolvedValueOnce(mockPackings)
        .mockResolvedValueOnce(mockUpdatedPackings);
      (prisma.status.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'pendingPackingStatusId',
          status_code: 'PENDING PACKING',
        })
        .mockResolvedValueOnce({
          id: 'processingPackingStatusId',
          status_code: 'PROCESSING PACKING',
        })
        .mockResolvedValueOnce({
          id: 'processingItemStatusId',
          status_code: 'PROCESSING ITEM',
        });
      (prisma.packingItem.updateMany as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (prisma.packing.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue({
        ...mockPurchaseOrder,
        packings: mockUpdatedPackings,
      });
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback(prisma);
        }
      );

      const result = await PackingService.processPacking(packingIds, userId);

      expect(result.message).toBe('Packing berhasil diproses');
      expect(result.processedCount).toBe(2);
      expect(result.processedPackingItemsCount).toBe(2);
      expect(result.packings).toEqual(mockUpdatedPackings);
      expect(prisma.packing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusId: 'processingPackingStatusId',
            updatedBy: userId,
          }),
        })
      );
      expect(createAuditLog).toHaveBeenCalled();
    });
  });

  describe('completePacking', () => {
    it('should complete multiple packings successfully', async () => {
      const userId = 'user123';
      const packingIds = ['packing1', 'packing2'];
      const mockPackingItems = [
        {
          id: 'item1',
          nama_barang: 'Item 1',
          total_qty: 10,
          jumlah_carton: 1,
          isi_per_carton: 10,
          no_box: 'BOX001',
          inventoryId: 'inv1',
          statusId: 'processingItemStatusId',
          status: {
            id: 'processingItemStatusId',
            status_code: 'PROCESSING ITEM',
          },
        },
        {
          id: 'item2',
          nama_barang: 'Item 2',
          total_qty: 5,
          jumlah_carton: 1,
          isi_per_carton: 5,
          no_box: 'BOX002',
          inventoryId: 'inv2',
          statusId: 'processingItemStatusId',
          status: {
            id: 'processingItemStatusId',
            status_code: 'PROCESSING ITEM',
          },
        },
      ];

      const mockPurchaseOrder = {
        id: 'po1',
        statusId: 'processingPOStatusId',
        status: {
          id: 'processingPOStatusId',
          status_code: 'PROCESSING PURCHASE ORDER',
        },
      };

      const mockPackings = [
        {
          id: 'packing1',
          packing_number: 'PKG-001',
          tanggal_packing: new Date(),
          statusId: 'processingPackingStatusId',
          purchaseOrderId: 'po1',
          packingItems: [mockPackingItems[0]],
          status: {
            id: 'processingPackingStatusId',
            status_code: 'PROCESSING PACKING',
          },
          purchaseOrder: mockPurchaseOrder,
        },
        {
          id: 'packing2',
          packing_number: 'PKG-002',
          tanggal_packing: new Date(),
          statusId: 'processingPackingStatusId',
          purchaseOrderId: 'po1',
          packingItems: [mockPackingItems[1]],
          status: {
            id: 'processingPackingStatusId',
            status_code: 'PROCESSING PACKING',
          },
          purchaseOrder: mockPurchaseOrder,
        },
      ];

      const mockUpdatedPackings = mockPackings.map((packing) => ({
        ...packing,
        statusId: 'completedPackingStatusId',
        status: {
          id: 'completedPackingStatusId',
          status_code: 'COMPLETED PACKING',
        },
        packingItems: packing.packingItems.map((item) => ({
          ...item,
          statusId: 'processedItemStatusId',
          status: {
            id: 'processedItemStatusId',
            status_code: 'PROCESSED ITEM',
          },
        })),
        purchaseOrder: mockPurchaseOrder,
      }));

      (prisma.packing.findMany as jest.Mock)
        .mockResolvedValueOnce(mockPackings)
        .mockResolvedValueOnce(mockUpdatedPackings);
      (prisma.status.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'processingPackingStatusId',
          status_code: 'PROCESSING PACKING',
        })
        .mockResolvedValueOnce({
          id: 'completedPackingStatusId',
          status_code: 'COMPLETED PACKING',
        })
        .mockResolvedValueOnce({
          id: 'processedItemStatusId',
          status_code: 'PROCESSED ITEM',
        });
      (prisma.packingItem.updateMany as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (prisma.packing.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue({
        ...mockPurchaseOrder,
        packings: mockUpdatedPackings,
      });
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback(prisma);
        }
      );

      const result = await PackingService.completePacking(packingIds, userId);

      expect(result.message).toBe('Packing berhasil diselesaikan');
      expect(result.completedCount).toBe(2);
      expect(result.completedPackingItemsCount).toBe(2);
      expect(result.packings).toEqual(mockUpdatedPackings);
      expect(prisma.packingItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packingId: { in: packingIds },
          }),
        })
      );
      expect(prisma.packing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusId: 'completedPackingStatusId',
            updatedBy: userId,
          }),
        })
      );
    });
  });
});
