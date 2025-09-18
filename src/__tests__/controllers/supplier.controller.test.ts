import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplierController } from '@/controllers/supplier.controller';
import { SupplierService } from '@/services/supplier.service';
import { CreateSupplierInput, UpdateSupplierInput, GetAllSuppliersInput } from '@/schemas/supplier.schema';

jest.mock('@/services/supplier.service');

describe('SupplierController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: { page: 1, limit: 10 },
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
      const createInput: CreateSupplierInput = { 
        name: 'Test Supplier', 
        code: 'SUP001',
        address: '123 Test St', 
        phoneNumber: '1234567890', 
        email: 'test@supplier.com',
        bank: {
          name: 'Test Bank',
          account: '1234567890',
          holder: 'Test Supplier'
        }
      };
      const supplier = { id: '1', ...createInput, createdAt: new Date(), updatedAt: new Date() };
      request.body = createInput;
      request.user = { id: 'user123', iat: 0, exp: 0 }; // Mock authenticated user
      (SupplierService.createSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.createSupplier(request as FastifyRequest<{ Body: CreateSupplierInput }>, reply as FastifyReply);

      expect(SupplierService.createSupplier).toHaveBeenCalledWith(createInput, 'user123');
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({ success: true, data: supplier });
    });
  });

  describe('getSuppliers', () => {
    it('should return all suppliers with pagination', async () => {
      const paginatedResult = {
        data: [{ id: '1', name: 'Test Supplier', code: 'SUP001', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };
      request.query = { page: 1, limit: 10 };
      (SupplierService.getAllSuppliers as jest.Mock).mockResolvedValue(paginatedResult);

      await SupplierController.getSuppliers(request as FastifyRequest<{ Querystring: GetAllSuppliersInput['query'] }>, reply as FastifyReply);

      expect(SupplierService.getAllSuppliers).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith({ success: true, data: paginatedResult });
    });
  });

  describe('getSupplier', () => {
    it('should return a single supplier by id', async () => {
      const supplier = { id: '1', name: 'Test Supplier', code: 'SUP001', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (SupplierService.getSupplierById as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.getSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.getSupplierById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith({ success: true, data: supplier });
    });

    it('should return 404 if supplier not found', async () => {
      request.params = { id: '1' };
      (SupplierService.getSupplierById as jest.Mock).mockRejectedValue(new Error('Supplier not found'));

      await expect(SupplierController.getSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply)).rejects.toThrow('Supplier not found');
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier and return it', async () => {
      const updateInput: UpdateSupplierInput['body'] = { name: 'Updated Name' };
      const supplier = { id: '1', name: 'Updated Name', code: 'SUP001', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      request.body = updateInput;
      request.user = { id: 'user123', iat: 0, exp: 0 }; // Mock authenticated user
      (SupplierService.updateSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.updateSupplier(request as FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>, reply as FastifyReply);

      expect(SupplierService.updateSupplier).toHaveBeenCalledWith('1', updateInput, 'user123');
      expect(reply.send).toHaveBeenCalledWith({ success: true, data: supplier });
    });

    it('should return 404 if supplier to update not found', async () => {
      const updateInput: UpdateSupplierInput['body'] = { name: 'Updated Name' };
      request.params = { id: '1' };
      request.body = updateInput;
      request.user = { id: 'user123', iat: 0, exp: 0 }; // Mock authenticated user
      (SupplierService.updateSupplier as jest.Mock).mockRejectedValue(new Error('Supplier not found'));

      await expect(SupplierController.updateSupplier(request as FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>, reply as FastifyReply)).rejects.toThrow('Supplier not found');
    });

    it('should update a supplier with system user if no user is authenticated', async () => {
      const updateInput: UpdateSupplierInput['body'] = { name: 'Updated Name' };
      const supplier = { id: '1', name: 'Updated Name' };
      request.params = { id: '1' };
      request.body = updateInput;
      request.user = undefined;
      (SupplierService.updateSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.updateSupplier(request as FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>, reply as FastifyReply);

      expect(SupplierService.updateSupplier).toHaveBeenCalledWith('1', updateInput, 'system');
      expect(reply.send).toHaveBeenCalledWith({ success: true, data: supplier });
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier and return 204', async () => {
      const supplier = { id: '1', name: 'Test Supplier', code: 'SUP001', address: '123 Test St', phoneNumber: '1234567890', email: 'test@supplier.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (SupplierService.deleteSupplier as jest.Mock).mockResolvedValue(supplier);

      await SupplierController.deleteSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(SupplierService.deleteSupplier).toHaveBeenCalledWith('1', 'system');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should return 404 if supplier to delete not found', async () => {
      request.params = { id: '1' };
      (SupplierService.deleteSupplier as jest.Mock).mockRejectedValue(new Error('Supplier not found'));

      await expect(SupplierController.deleteSupplier(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply)).rejects.toThrow('Supplier not found');
    });
  });
});
