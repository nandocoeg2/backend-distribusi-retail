// @ts-nocheck
import { prisma } from '@/config/database';
import {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  searchInventories,
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
      count: jest.fn(),
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
      expect(prisma.inventory.create).toHaveBeenCalledWith({ 
        data: {
          ...input,
          createdBy: 'system',
          updatedBy: 'system',
        }
      });
    });
  });

  describe('getAllInventories', () => {
    it('should return paginated inventories', async () => {
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
      ];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);
      (prisma.inventory.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllInventories(1, 10);
      expect(result).toEqual({
        data: mockInventories,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
      expect(prisma.inventory.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(prisma.inventory.count).toHaveBeenCalled();
    });
  });

  describe('searchInventories', () => {
    it('should return inventories matching the query with pagination', async () => {
      const query = 'Test';
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
      ];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);
      (prisma.inventory.count as jest.Mock).mockResolvedValue(1);

      const result = await searchInventories(query, 1, 10);
      expect(result).toEqual({
        data: mockInventories,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
      expect(prisma.inventory.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              nama_barang: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              kode_barang: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(prisma.inventory.count).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              nama_barang: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              kode_barang: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    });

    it('should return all inventories with pagination if no query is provided', async () => {
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
      ];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(mockInventories);
      (prisma.inventory.count as jest.Mock).mockResolvedValue(1);

      const result = await searchInventories(undefined, 1, 10);
      expect(result).toEqual({
        data: mockInventories,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
      expect(prisma.inventory.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(prisma.inventory.count).toHaveBeenCalled();
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
    it('should update an inventory when it exists', async () => {
      const data: UpdateInventoryInput['body'] = { stok_barang: 150, min_stok: 20 };
      const existingInventory = {
        id: '1',
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedInventory = { ...existingInventory, ...data };
      
      (prisma.inventory.findUnique as jest.Mock).mockResolvedValue(existingInventory);
      (prisma.inventory.update as jest.Mock).mockResolvedValue(updatedInventory);

      const result = await updateInventory('1', data);
      expect(result).toEqual(updatedInventory);
      expect(prisma.inventory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.inventory.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: {
          ...data,
          updatedBy: 'system',
        }
      });
    });

    it('should return null when inventory does not exist', async () => {
      const data: UpdateInventoryInput['body'] = { stok_barang: 150, min_stok: 20 };
      
      (prisma.inventory.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateInventory('1', data);
      expect(result).toBeNull();
      expect(prisma.inventory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.inventory.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteInventory', () => {
    it('should delete an inventory when it exists', async () => {
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
      (prisma.inventory.delete as jest.Mock).mockResolvedValue(mockInventory);

      const result = await deleteInventory('1');
      expect(result).toEqual(mockInventory);
      expect(prisma.inventory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.inventory.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null when inventory does not exist', async () => {
      (prisma.inventory.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await deleteInventory('1');
      expect(result).toBeNull();
      expect(prisma.inventory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.inventory.delete).not.toHaveBeenCalled();
    });
  });
});
