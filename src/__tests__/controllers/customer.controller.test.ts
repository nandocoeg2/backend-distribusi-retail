import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerController } from '@/controllers/customer.controller';
import { CustomerService } from '@/services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput, SearchCustomerInput } from '@/schemas/customer.schema';

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
    it('should return all customers', async () => {
      const customers = [{ id: '1', name: 'Test Customer', address: '123 Test St', phoneNumber: '1234567890', email: 'test@customer.com', createdAt: new Date(), updatedAt: new Date() }];
      (CustomerService.getAllCustomers as jest.Mock).mockResolvedValue(customers);

      await CustomerController.getCustomers(request as FastifyRequest, reply as FastifyReply);

      expect(CustomerService.getAllCustomers).toHaveBeenCalled();
      expect(reply.send).toHaveBeenCalledWith(customers);
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
    it('should return customers that match the query', async () => {
      const query = 'John';
      const customers = [
        { id: '1', name: 'John Doe', address: '123 Test St', phoneNumber: '1234567890', email: 'john@test.com' },
      ];
      request.query = { q: query };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue(customers);

      await CustomerController.searchCustomers(
        request as FastifyRequest<{ Querystring: SearchCustomerInput['querystring'] }>,
        reply as FastifyReply
      );

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith(query);
      expect(reply.send).toHaveBeenCalledWith(customers);
    });

    it('should return an empty array if no customers match', async () => {
      const query = 'NonExistent';
      request.query = { q: query };
      (CustomerService.searchCustomers as jest.Mock).mockResolvedValue([]);

      await CustomerController.searchCustomers(
        request as FastifyRequest<{ Querystring: SearchCustomerInput['querystring'] }>,
        reply as FastifyReply
      );

      expect(CustomerService.searchCustomers).toHaveBeenCalledWith(query);
      expect(reply.send).toHaveBeenCalledWith([]);
    });
  });
});
