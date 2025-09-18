// @ts-nocheck
import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryController } from '@/controllers/inventory.controller';
import { InventoryService } from '@/services/inventory.service';
import { 
  CreateInventoryInput, 
  UpdateInventoryInput, 
  GetAllInventoriesInput, 
  SearchInventoryInput
} from '@/schemas/inventory.schema';

jest.mock('@/services/inventory.service');

const mockInventory = {
  id: '1',
  plu: 'PLU001',
  nama_barang: 'Test Item',
  stok_c: 10,
  stok_q: 100,
  harga_barang: 10000,
  min_stok: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user-id',
  updatedBy: 'test-user-id',
};

describe('Inventory Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'test-user-id' }
    };
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an inventory and return 201', async () => {
      const createInventoryInput: CreateInventoryInput = {
        plu: 'PLU001',
        nama_barang: 'Test Item',
        stok_c: 10,
        stok_q: 100,
        harga_barang: 10000,
        min_stok: 10,
      };
      request.body = createInventoryInput;
      (InventoryService.create as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.create(
        request as FastifyRequest<{ Body: CreateInventoryInput }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockInventory
      }));
    });
  });

  describe('getAll', () => {
    it('should get all inventories with pagination and return 200', async () => {
      const mockPaginatedInventories = {
        data: [mockInventory],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
      request.query = { page: 1, limit: 10 };
      (InventoryService.getAll as jest.Mock).mockResolvedValue(mockPaginatedInventories);

      await InventoryController.getAll(
        request as FastifyRequest<{ Querystring: GetAllInventoriesInput['query'] }>,
        reply as FastifyReply
      );

      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockPaginatedInventories
      }));
      expect(InventoryService.getAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('search', () => {
    it('should search inventories with pagination and return 200', async () => {
      const mockPaginatedInventories = {
        data: [mockInventory],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
      request.query = { q: 'Test', page: 1, limit: 10 };
      (InventoryService.search as jest.Mock).mockResolvedValue(mockPaginatedInventories);

      await InventoryController.search(
        request as FastifyRequest<{ Querystring: SearchInventoryInput['query'] }>,
        reply as FastifyReply
      );

      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockPaginatedInventories
      }));
      expect(InventoryService.search).toHaveBeenCalledWith('Test', 1, 10);
    });
  });

  describe('getById', () => {
    it('should get an inventory by id and return 200', async () => {
      request.params = { id: '1' };
      (InventoryService.getById as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.getById(
        request as FastifyRequest<{ Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockInventory
      }));
    });
  });

  describe('update', () => {
    it('should update an inventory and return 200', async () => {
      const updateInventoryInput: UpdateInventoryInput['body'] = { stok_c: 150 };
      request.body = updateInventoryInput;
      request.params = { id: '1' };
      const updatedInventory = { ...mockInventory, ...updateInventoryInput };
      (InventoryService.update as jest.Mock).mockResolvedValue(updatedInventory);

      await InventoryController.update(
        request as FastifyRequest<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: updatedInventory
      }));
    });
  });

  describe('delete', () => {
    it('should delete an inventory and return 204', async () => {
      request.params = { id: '1' };
      (InventoryService.delete as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.delete(
        request as FastifyRequest<{ Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });
  });
});
