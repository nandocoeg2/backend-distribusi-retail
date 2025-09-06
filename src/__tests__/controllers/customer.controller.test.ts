import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerController } from '@/controllers/customer.controller';
import { CustomerService } from '@/services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput, SearchCustomerInput, GetAllCustomersInput } from '@/schemas/customer.schema';

jest.mock('@/services/customer.service');

describe('CustomerController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
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
      const createInput: CreateCustomerInput = { name: 'Test Customer', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com' };
      const customer = { id: '1', ...createInput, createdAt: new Date(), updatedAt: new Date() };
      request.body = createInput;
      (CustomerService.createCustomer as jest.Mock).mockResolvedValue(customer);

      await CustomerController.createCustomer(request as FastifyRequest<{ Body: CreateCustomerInput }>, reply as FastifyReply);

      expect(CustomerService.createCustomer).toHaveBeenCalledWith(createInput);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(customer);
    });
  });

  describe('getCustomers', () => {
    it('should return all customers with pagination', async () => {
      const paginatedResult = {
        data: [{ id: '1', name: 'Test Customer', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com', createdAt: new Date(), updatedAt: new Date() }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };
      request.query = { page: 1, limit: 10 };
      (CustomerService.getAllCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.getCustomers(request as FastifyRequest<{ Querystring: GetAllCustomersInput['query'] }>, reply as FastifyReply);

      expect(CustomerService.getAllCustomers).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(paginatedResult);
    });
  });

  describe('getCustomer', () => {
    it('should return a single customer by id', async () => {
      const customer = { id: '1', name: 'Test Customer', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (CustomerService.getCustomerById as jest.Mock).mockResolvedValue(customer);

      await CustomerController.getCustomer(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(CustomerService.getCustomerById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(customer);
    });

    it('should return 404 if customer not found', async () => {
      request.params = { id: '1' };
      (CustomerService.getCustomerById as jest.Mock).mockResolvedValue(null);

      await CustomerController.getCustomer(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(CustomerService.getCustomerById).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer and return it', async () => {
      const updateInput: UpdateCustomerInput['body'] = { name: 'Updated Name' };
      const customer = { id: '1', name: 'Updated Name', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      request.body = updateInput;
      (CustomerService.updateCustomer as jest.Mock).mockResolvedValue(customer);

      await CustomerController.updateCustomer(request as FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>, reply as FastifyReply);

      expect(CustomerService.updateCustomer).toHaveBeenCalledWith('1', updateInput);
      expect(reply.send).toHaveBeenCalledWith(customer);
    });

    it('should return 404 if customer to update not found', async () => {
      const updateInput: UpdateCustomerInput['body'] = { name: 'Updated Name' };
      request.params = { id: '1' };
      request.body = updateInput;
      (CustomerService.updateCustomer as jest.Mock).mockResolvedValue(null);

      await CustomerController.updateCustomer(request as FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>, reply as FastifyReply);

      expect(CustomerService.updateCustomer).toHaveBeenCalledWith('1', updateInput);
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer and return 204', async () => {
      const customer = { id: '1', name: 'Test Customer', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com', createdAt: new Date(), updatedAt: new Date() };
      request.params = { id: '1' };
      (CustomerService.deleteCustomer as jest.Mock).mockResolvedValue(customer);

      await CustomerController.deleteCustomer(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(CustomerService.deleteCustomer).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should return 404 if customer to delete not found', async () => {
      request.params = { id: '1' };
      (CustomerService.deleteCustomer as jest.Mock).mockResolvedValue(null);

      await CustomerController.deleteCustomer(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(CustomerService.deleteCustomer).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
  });

  describe('searchCustomers', () => {
    it('should return customers that match the param with pagination', async () => {
      const query = 'John';
      const paginatedResult = {
        data: [
          { id: '1', name: 'John Doe', address: '123 Test St', phoneNumber: '1234567890', email: 'john@test.com', createdAt: new Date(), updatedAt: new Date() },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };
      request.params = { q: query };
      request.query = { page: 1, limit: 10 };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.searchCustomers(
        request as FastifyRequest<{ Params: { q: string }; Querystring: GetAllCustomersInput['query'] }>,
        reply as FastifyReply
      );

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith(query, 1, 10);
      expect(reply.send).toHaveBeenCalledWith(paginatedResult);
    });

    it('should return an empty array if no customers match', async () => {
      const query = 'NonExistent';
      const paginatedResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        }
      };
      request.params = { q: query };
      request.query = { page: 1, limit: 10 };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.searchCustomers(
        request as FastifyRequest<{ Params: { q: string }; Querystring: GetAllCustomersInput['query'] }>,
        reply as FastifyReply
      );

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith(query, 1, 10);
      expect(reply.send).toHaveBeenCalledWith(paginatedResult);
    });

    it('should return all customers if param is not provided', async () => {
      const paginatedResult = {
        data: [
          { id: '1', name: 'John Doe', address: '123 Test St', phoneNumber: '1234567890', email: 'john@test.com', createdAt: new Date(), updatedAt: new Date() },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };
      request.params = {};
      request.query = { page: 1, limit: 10 };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue(paginatedResult);

      await CustomerController.searchCustomers(
        request as FastifyRequest<{ Params: { q?: string }; Querystring: GetAllCustomersInput['query'] }>,
        reply as FastifyReply
      );

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith(undefined, 1, 10);
      expect(reply.send).toHaveBeenCalledWith(paginatedResult);
    });
  });
});
