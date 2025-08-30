import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createInventoryHandler,
  getAllInventoriesHandler,
  getInventoryByIdHandler,
  updateInventoryHandler,
  deleteInventoryHandler,
} from '@/controllers/inventory.controller';
import * as inventoryService from '@/services/inventory.service';
import { AppError } from '@/utils/app-error';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

const mockInventory = {
  id: '1',
  kode_barang: 'BRG001',
  nama_barang: 'Test Item',
  stok_barang: 100,
  harga_barang: 10000,
  min_stok: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Inventory Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
    };
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventoryHandler', () => {
    it('should create an inventory and return 201', async () => {
      const createInventoryInput: CreateInventoryInput = {
        kode_barang: 'BRG001',
        nama_barang: 'Test Item',
        stok_barang: 100,
        harga_barang: 10000,
        min_stok: 10,
      };
      request.body = createInventoryInput;
      jest.spyOn(inventoryService, 'createInventory').mockResolvedValue(mockInventory);

      await createInventoryHandler(
        request as FastifyRequest<{ Body: CreateInventoryInput }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(mockInventory);
    });
  });

  describe('getAllInventoriesHandler', () => {
    it('should get all inventories and return 200', async () => {
      const mockInventories = [mockInventory];
      jest.spyOn(inventoryService, 'getAllInventories').mockResolvedValue(mockInventories);

      await getAllInventoriesHandler(request as FastifyRequest, reply as FastifyReply);

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(mockInventories);
    });
  });

  describe('getInventoryByIdHandler', () => {
    it('should get an inventory by id and return 200', async () => {
      request.params = { id: '1' };
      jest.spyOn(inventoryService, 'getInventoryById').mockResolvedValue(mockInventory);

      await getInventoryByIdHandler(
        request as FastifyRequest<{ Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(mockInventory);
    });

    it('should return 404 if inventory not found', async () => {
      request.params = { id: '1' };
      jest.spyOn(inventoryService, 'getInventoryById').mockResolvedValue(null);

      await expect(
        getInventoryByIdHandler(
          request as FastifyRequest<{ Params: { id: string } }>,
          reply as FastifyReply
        )
      ).rejects.toThrow(new AppError('Inventory not found', 404));
    });
  });

  describe('updateInventoryHandler', () => {
    it('should update an inventory and return 200', async () => {
      const updateInventoryInput: UpdateInventoryInput['body'] = { stok_barang: 150 };
      request.body = updateInventoryInput;
      request.params = { id: '1' };
      const updatedInventory = { ...mockInventory, ...updateInventoryInput };
      jest.spyOn(inventoryService, 'updateInventory').mockResolvedValue(updatedInventory);

      await updateInventoryHandler(
        request as FastifyRequest<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(updatedInventory);
    });
  });

  describe('deleteInventoryHandler', () => {
    it('should delete an inventory and return 204', async () => {
      request.params = { id: '1' };
      jest.spyOn(inventoryService, 'deleteInventory').mockResolvedValue({} as any);

      await deleteInventoryHandler(
        request as FastifyRequest<{ Params: { id: string } }>,
        reply as FastifyReply
      );

      expect(reply.status).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });
  });
});

