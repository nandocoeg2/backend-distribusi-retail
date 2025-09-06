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

      const mockPurchaseOrder = { id: 'po1' };
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
          tanggal_packing: mockPackingData.tanggal_packing,
          statusId: 'status1',
          purchaseOrderId: 'po1',
          updatedBy: 'user1',
          packingItems: {
            create: mockPackingData.packingItems,
          },
        },
        include: {
          packingItems: true,
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
  });

  describe('getAllPackings', () => {
    it('should return paginated packings', async () => {
      const mockPackings = [
        {
          id: 'packing1',
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
          packingItems: true,
          purchaseOrder: true,
          status: true,
        },
      });
    });
  });
});
