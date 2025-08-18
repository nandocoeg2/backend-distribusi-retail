// @ts-nocheck
import { prisma } from '@/config/database';
import {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from '@/services/inventory.service';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

// Mock the database module
jest.mock('@/config/database', () => ({
  prisma: {
    inventory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Inventory Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('should create an inventory', async () => {
      const input: CreateInventoryInput = {
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 10000,
        min_stok: 10,
      };
      const mockInventory = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

      (prisma.inventory.create as jest.Mock).mockResolvedValue(mockInventory);

      const result = await createInventory(input);
      expect(result).toEqual(mockInventory);
      expect(prisma.inventory.create).toHaveBeenCalledWith({ data: input });
    });
  });

  describe('getAllInventories', () => {
    it('should return all inventories', async () => {
      const mockInventories = [
        {
          id: '1',
          kode_barang: 'BRG001',
          nama_barang: 'Test Item 1',
          stok_barang: 100,
          harga_barang: 10000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          kode_barang: 'BRG002',
          nama_barang: 'Test Item 2',
          stok_barang: 200,
          harga_barang: 20000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);

      const result = await getAllInventories();
      expect(result).toEqual(mockInventories);
      expect(prisma.inventory.findMany).toHaveBeenCalled();
    });
  });

  describe('getInventoryById', () => {
    it('should return an inventory by id', async () => {
      const mockInventory = {
        id: '1',
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.inventory.findUnique as jest.Mock).mockResolvedValue(mockInventory);

      const result = await getInventoryById('1');
      expect(result).toEqual(mockInventory);
      expect(prisma.inventory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('updateInventory', () => {
    it('should update an inventory', async () => {
      const data: UpdateInventoryInput['body'] = { stok_barang: 150, min_stok: 20 };
      const mockInventory = {
        id: '1',
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 150,
        harga_barang: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.inventory.update as jest.Mock).mockResolvedValue(mockInventory);

      const result = await updateInventory('1', data);
      expect(result).toEqual(mockInventory);
      expect(prisma.inventory.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
    });
  });

  describe('deleteInventory', () => {
    it('should delete an inventory', async () => {
      const mockInventory = {
        id: '1',
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.inventory.delete as jest.Mock).mockResolvedValue(mockInventory);

      const result = await deleteInventory('1');
      expect(result).toEqual(mockInventory);
      expect(prisma.inventory.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
