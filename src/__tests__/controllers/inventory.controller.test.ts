import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryController } from '@/controllers/inventory.controller';
import { InventoryService } from '@/services/inventory.service';
import { ResponseUtil } from '@/utils/response.util';
import { CreateInventoryInput } from '@/schemas/inventory.schema';

jest.mock('@/services/inventory.service');

describe('InventoryController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', iat: 0, exp: 0 }
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
    it('should create an inventory item and return it', async () => {
      const createInput: CreateInventoryInput = {
        kode_barang: 'TEST01',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 1000,
        min_stok: 10,
      };
      const mockInventory = { id: '1', ...createInput };
      request.body = createInput;
      (InventoryService.create as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.create(request as FastifyRequest<{ Body: CreateInventoryInput }>, reply as FastifyReply);

      expect(InventoryService.create).toHaveBeenCalledWith(createInput, 'user123');
      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventory));
    });

    it('should create an inventory item with system user if no user is authenticated', async () => {
      const createInput: CreateInventoryInput = {
        kode_barang: 'TEST01',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 1000,
        min_stok: 10,
      };
      const mockInventory = { id: '1', ...createInput };
      request.body = createInput;
      request.user = undefined; // No user on request
      (InventoryService.create as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.create(request as FastifyRequest<{ Body: CreateInventoryInput }>, reply as FastifyReply);

      expect(InventoryService.create).toHaveBeenCalledWith(createInput, 'system');
      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventory));
    });
  });

  describe('getAll', () => {
    it('should get all inventory items with pagination', async () => {
      const mockInventories = { data: [{ id: '1', name: 'Test Item' }], pagination: {} };
      request.query = { page: '1', limit: '10' };
      (InventoryService.getAll as jest.Mock).mockResolvedValue(mockInventories);

      await InventoryController.getAll(request as any, reply as FastifyReply);

      expect(InventoryService.getAll).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventories));
    });
  });

  describe('search', () => {
    it('should search for inventory items', async () => {
      const mockInventories = { data: [{ id: '1', name: 'Test Item' }], pagination: {} };
      request.query = { q: 'Test', page: '1', limit: '10' };
      (InventoryService.search as jest.Mock).mockResolvedValue(mockInventories);

      await InventoryController.search(request as any, reply as FastifyReply);

      expect(InventoryService.search).toHaveBeenCalledWith('Test', 1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventories));
    });
  });

  describe('getById', () => {
    it('should get an inventory item by id', async () => {
      const mockInventory = { id: '1', name: 'Test Item' };
      request.params = { id: '1' };
      (InventoryService.getById as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.getById(request as any, reply as FastifyReply);

      expect(InventoryService.getById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventory));
    });
  });

  describe('update', () => {
    it('should update an inventory item and return it', async () => {
      const mockInventory = { id: '1', name: 'Updated Item' };
      request.params = { id: '1' };
      request.body = { name: 'Updated Item' };
      (InventoryService.update as jest.Mock).mockResolvedValue(mockInventory);

      await InventoryController.update(request as any, reply as FastifyReply);

      expect(InventoryService.update).toHaveBeenCalledWith('1', request.body, 'user123');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockInventory));
    });
  });

  describe('delete', () => {
    it('should delete an inventory item and return 204', async () => {
      request.params = { id: '1' };
      (InventoryService.delete as jest.Mock).mockResolvedValue(undefined);

      await InventoryController.delete(request as any, reply as FastifyReply);

      expect(InventoryService.delete).toHaveBeenCalledWith('1', 'user123');
      expect(reply.status).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });
  });
});
