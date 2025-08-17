import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplierController } from '@/controllers/supplier.controller';
import { SupplierService } from '@/services/supplier.service';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';

jest.mock('@/services/supplier.service');

describe('SupplierController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
    };
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('should create a supplier and return 201', async () => {
      const createInput: CreateSupplierInput = { name: 'Test Supplier', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com' };
      const supplier = { id: '1', ...createInput, createdAt: new Date(), updatedAt: new Date() };
      request.body = createInput;
      (SupplierService.createSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.createSupplier(request as FastifyRequest<{ Body: CreateSupplierInput }>, reply as FastifyReply);

      expect(SupplierService.createSupplier).toHaveBeenCalledWith(createInput);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(supplier);
    });
  });

  describe('getSuppliers', () => {
    it('should return all suppliers', async () => {
      const suppliers = [{ id: '1', name: 'Test Supplier', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() }];
      (SupplierService.getAllSuppliers as jest.Mock).mockResolvedValue(suppliers);

      await SupplierController.getSuppliers(request as FastifyRequest, reply as FastifyReply);

      expect(SupplierService.getAllSuppliers).toHaveBeenCalled();
      expect(reply.send).toHaveBeenCalledWith(suppliers);
    });
  });

  describe('getSupplier', () => {
    it('should return a single supplier by id', async () => {
      const supplier = { id: '1', name: 'Test Supplier', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (SupplierService.getSupplierById as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.getSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.getSupplierById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(supplier);
    });

    it('should return 404 if supplier not found', async () => {
      request.params = { id: '1' };
      (SupplierService.getSupplierById as jest.Mock).mockResolvedValue(null);

      await SupplierController.getSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.getSupplierById).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier and return it', async () => {
      const updateInput: UpdateSupplierInput['body'] = { name: 'Updated Name' };
      const supplier = { id: '1', name: 'Updated Name', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      request.body = updateInput;
      (SupplierService.updateSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.updateSupplier(request as FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>, reply as FastifyReply);

      expect(SupplierService.updateSupplier).toHaveBeenCalledWith('1', updateInput);
      expect(reply.send).toHaveBeenCalledWith(supplier);
    });

    it('should return 404 if supplier to update not found', async () => {
      const updateInput: UpdateSupplierInput['body'] = { name: 'Updated Name' };
      request.params = { id: '1' };
      request.body = updateInput;
      (SupplierService.updateSupplier as jest.Mock).mockResolvedValue(null);

      await SupplierController.updateSupplier(request as FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>, reply as FastifyReply);

      expect(SupplierService.updateSupplier).toHaveBeenCalledWith('1', updateInput);
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier and return 204', async () => {
      const supplier = { id: '1', name: 'Test Supplier', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (SupplierService.deleteSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.deleteSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.deleteSupplier).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should return 404 if supplier to delete not found', async () => {
      request.params = { id: '1' };
      (SupplierService.deleteSupplier as jest.Mock).mockResolvedValue(null);

      await SupplierController.deleteSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.deleteSupplier).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });
  });
});
