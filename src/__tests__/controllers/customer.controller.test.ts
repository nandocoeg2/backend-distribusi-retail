import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerController } from '@/controllers/customer.controller';
import { CustomerService } from '@/services/customer.service';
import { ResponseUtil } from '@/utils/response.util';
import { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';

jest.mock('@/services/customer.service');

describe('CustomerController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', iat: 0, exp: 0 },
    };
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer and return 201', async () => {
      const createInput: CreateCustomerInput = {
        namaCustomer: 'Test Customer',
        kodeCustomer: 'CUST-001',
        alamatPengiriman: '123 Test St',
        phoneNumber: '1234567890',
        email: 'test@customer.com',
        groupCustomerId: 'group1',
        regionId: 'region1',
      };
      request.body = createInput;
      const customer = { id: '1', ...createInput };
      (CustomerService.createCustomer as jest.Mock).mockResolvedValue(customer);

      await CustomerController.createCustomer(request as any, reply as FastifyReply);

      expect(CustomerService.createCustomer).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(customer));
    });

    it('should create a customer with system user if no user is authenticated', async () => {
      const createInput: CreateCustomerInput = {
        namaCustomer: 'Test Customer',
        kodeCustomer: 'CUST-001',
        alamatPengiriman: '123 Test St',
        phoneNumber: '1234567890',
        email: 'test@customer.com',
        groupCustomerId: 'group1',
        regionId: 'region1',
      };
      request.body = createInput;
      request.user = undefined; // No user on request
      const customer = { id: '1', ...createInput };
      (CustomerService.createCustomer as jest.Mock).mockResolvedValue(customer);

      await CustomerController.createCustomer(request as any, reply as FastifyReply);

      const expectedCustomerData = {
        ...createInput,
        createdBy: 'system',
        updatedBy: 'system',
      };

      expect(CustomerService.createCustomer).toHaveBeenCalledWith(expectedCustomerData);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(customer));
    });
  });

  describe('getCustomers', () => {
    it('should return all customers with pagination', async () => {
      const paginatedResult = {
        data: [{ id: '1', namaCustomer: 'Test Customer' }],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
      };
      request.query = { page: '1', limit: '10' };
      (CustomerService.getAllCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.getCustomers(request as any, reply as FastifyReply);

      expect(CustomerService.getAllCustomers).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(paginatedResult));
    });
  });

  describe('getCustomer', () => {
    it('should return a single customer by id', async () => {
      const customer = { id: '1', namaCustomer: 'Test Customer' };
      request.params = { id: '1' };
      (CustomerService.getCustomerById as jest.Mock).mockResolvedValue(customer);

      await CustomerController.getCustomer(request as any, reply as FastifyReply);

      expect(CustomerService.getCustomerById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(customer));
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer and return it', async () => {
        const updateInput: UpdateCustomerInput['body'] = { namaCustomer: 'Updated Name' };
        const customer = { id: '1', namaCustomer: 'Updated Name' };
        request.params = { id: '1' };
        request.body = updateInput;
        (CustomerService.updateCustomer as jest.Mock).mockResolvedValue(customer);

        await CustomerController.updateCustomer(request as any, reply as FastifyReply);

        expect(CustomerService.updateCustomer).toHaveBeenCalledWith('1', expect.any(Object));
        expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(customer));
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer and return 204', async () => {
        request.params = { id: '1' };
        (CustomerService.deleteCustomer as jest.Mock).mockResolvedValue({} as any);

        await CustomerController.deleteCustomer(request as any, reply as FastifyReply);

        expect(CustomerService.deleteCustomer).toHaveBeenCalledWith('1');
        expect(reply.code).toHaveBeenCalledWith(204);
        expect(reply.send).toHaveBeenCalled();
    });
  });

  describe('searchCustomers', () => {
    it('should search for customers', async () => {
      const paginatedResult = {
        data: [{ id: '1', namaCustomer: 'Test Customer' }],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
      };
      request.query = { q: 'Test', page: '1', limit: '10' };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.searchCustomers(request as any, reply as FastifyReply);

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith('Test', 1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(paginatedResult));
    });
  });
});
