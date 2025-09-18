import { PackingService } from '@/services/packing.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

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

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);
      (prisma.packing.create as jest.Mock).mockResolvedValue(mockPackingResult);

      const result = await PackingService.createPacking(mockPackingData, 'user123');

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

      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(mockExistingPacking);
      (prisma.packing.update as jest.Mock).mockResolvedValue(mockUpdatedPacking);
      (prisma.packingItem.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.packingItem.createMany as jest.Mock).mockResolvedValue({});

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      const result = await PackingService.updatePacking('packing1', mockUpdateData, 'user123');

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
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(mockDeletedPacking);
      (prisma.packing.delete as jest.Mock).mockResolvedValue(mockDeletedPacking);

      const result = await PackingService.deletePacking('packing1', 'user123');

      expect(result).toEqual(mockDeletedPacking);
    });

    it('should return null if packing not found', async () => {
      (prisma.packing.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await PackingService.deletePacking('packing1', 'user123');

      expect(result).toBeNull();
    });
  });
});
