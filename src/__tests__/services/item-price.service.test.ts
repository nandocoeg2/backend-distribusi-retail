import { ItemPriceService } from '@/services/item-price.service';
import { prisma } from '@/config/database';
import { CreateItemPriceInput, UpdateItemPriceInput } from '@/schemas/item-price.schema';
import { AppError } from '@/utils/app-error';

// Mock Prisma and Audit Service
jest.mock('@/config/database', () => ({
  prisma: {
    itemPrice: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditTrail: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

describe('ItemPriceService', () => {
  const userId = 'user123';
  const itemPriceId = 'price123';
  const mockItemPrice = {
    id: itemPriceId,
    inventoryId: 'inv123',
    customerId: 'cust123',
    harga: 100,
    pot1: 10,
    harga1: 90,
    pot2: 5,
    harga2: 85.5,
    ppn: 11,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
    updatedBy: userId,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItemPrice', () => {
    it('should create a new item price and log the action', async () => {
      const input: CreateItemPriceInput = {
        inventoryId: 'inv123',
        customerId: 'cust123',
        harga: 100,
        pot1: 10,
        harga1: 90,
        pot2: 5,
        harga2: 85.5,
        ppn: 11,
      };

      (prisma.itemPrice.create as jest.Mock).mockResolvedValue(mockItemPrice);

      const result = await ItemPriceService.createItemPrice(input, userId);

      expect(prisma.itemPrice.create).toHaveBeenCalledWith({
        data: { ...input, createdBy: userId, updatedBy: userId },
      });
      expect(require('@/services/audit.service').createAuditLog).toHaveBeenCalledWith(
        'ItemPrice',
        mockItemPrice.id,
        'CREATE',
        userId,
        mockItemPrice
      );
      expect(result).toEqual(mockItemPrice);
    });
  });

  describe('getAllItemPrices', () => {
    it('should return all item prices with pagination', async () => {
      const itemPrices = [mockItemPrice];
      (prisma.itemPrice.findMany as jest.Mock).mockResolvedValue(itemPrices);
      (prisma.itemPrice.count as jest.Mock).mockResolvedValue(1);

      const result = await ItemPriceService.getAllItemPrices(1, 10);

      expect(prisma.itemPrice.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(itemPrices);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('getItemPriceById', () => {
    it('should return an item price by id with audit trails', async () => {
      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(mockItemPrice);
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue([]);

      const result = await ItemPriceService.getItemPriceById(itemPriceId);

      expect(prisma.itemPrice.findUnique).toHaveBeenCalledWith({ where: { id: itemPriceId } });
      expect(result).toHaveProperty('auditTrails');
      expect(result.id).toEqual(itemPriceId);
    });

    it('should throw AppError if item price not found', async () => {
      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(ItemPriceService.getItemPriceById('nonexistent')).rejects.toThrow(
        new AppError('ItemPrice not found', 404)
      );
    });
  });

  describe('updateItemPrice', () => {
    it('should update an item price and log the action', async () => {
      const updateData: UpdateItemPriceInput['body'] = { harga: 110 };
      const updatedItemPrice = { ...mockItemPrice, ...updateData, updatedAt: new Date() };

      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(mockItemPrice);
      (prisma.itemPrice.update as jest.Mock).mockResolvedValue(updatedItemPrice);

      const result = await ItemPriceService.updateItemPrice(itemPriceId, updateData, userId);

      expect(prisma.itemPrice.update).toHaveBeenCalledWith({
        where: { id: itemPriceId },
        data: { ...updateData, updatedBy: userId },
      });
      expect(require('@/services/audit.service').createAuditLog).toHaveBeenCalledWith(
        'ItemPrice',
        updatedItemPrice.id,
        'UPDATE',
        userId,
        { before: mockItemPrice, after: updatedItemPrice }
      );
      expect(result).toEqual(updatedItemPrice);
    });

    it('should throw AppError if item price to update is not found', async () => {
      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(ItemPriceService.updateItemPrice('nonexistent', {}, userId)).rejects.toThrow(
        new AppError('ItemPrice not found', 404)
      );
    });
  });

  describe('deleteItemPrice', () => {
    it('should delete an item price and log the action', async () => {
      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(mockItemPrice);
      (prisma.itemPrice.delete as jest.Mock).mockResolvedValue(mockItemPrice);

      const result = await ItemPriceService.deleteItemPrice(itemPriceId, userId);

      expect(prisma.itemPrice.delete).toHaveBeenCalledWith({ where: { id: itemPriceId } });
      expect(require('@/services/audit.service').createAuditLog).toHaveBeenCalledWith(
        'ItemPrice',
        itemPriceId,
        'DELETE',
        userId,
        mockItemPrice
      );
      expect(result).toEqual(mockItemPrice);
    });

    it('should throw AppError if item price to delete is not found', async () => {
      (prisma.itemPrice.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(ItemPriceService.deleteItemPrice('nonexistent', userId)).rejects.toThrow(
        new AppError('ItemPrice not found', 404)
      );
    });
  });

  describe('searchItemPrices', () => {
    it('should return item prices matching the search query', async () => {
        const query = 'barang';
        const itemPrices = [mockItemPrice];
        (prisma.itemPrice.findMany as jest.Mock).mockResolvedValue(itemPrices);
        (prisma.itemPrice.count as jest.Mock).mockResolvedValue(1);

        const result = await ItemPriceService.searchItemPrices(query, 1, 10);

        expect(prisma.itemPrice.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { inventory: { nama_barang: { contains: query, mode: 'insensitive' } } },
                    { customer: { namaCustomer: { contains: query, mode: 'insensitive' } } },
                ],
            },
            skip: 0,
            take: 10,
            orderBy: { createdAt: 'desc' },
        });
        expect(result.data).toEqual(itemPrices);
    });
  });
});
