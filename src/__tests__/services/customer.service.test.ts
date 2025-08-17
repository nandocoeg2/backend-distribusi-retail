import { CustomerService } from '@/services/customer.service';
import { prisma } from '@/config/database';
import { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('CustomerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const input: CreateCustomerInput = {
        name: 'John Doe',
        address: '123 Main St',
        phoneNumber: '1234567890',
        email: 'john.doe@example.com',
      };
      const expectedCustomer = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.create as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.createCustomer(input);

      expect(prisma.customer.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(expectedCustomer);
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      const expectedCustomers = [
        { id: '1', name: 'John Doe', email: 'john.doe@example.com', address: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com', address: '456 Oak Ave', phoneNumber: '0987654321', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.customer.findMany as jest.Mock).mockResolvedValue(expectedCustomers);

      const result = await CustomerService.getAllCustomers();

      expect(prisma.customer.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedCustomers);
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by id', async () => {
      const customerId = '1';
      const expectedCustomer = { id: customerId, name: 'John Doe', email: 'john.doe@example.com', address: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.getCustomerById(customerId);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({ where: { id: customerId } });
      expect(result).toEqual(expectedCustomer);
    });

    it('should return null if customer not found', async () => {
      const customerId = '999';
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await CustomerService.getCustomerById(customerId);

      expect(result).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const customerId = '1';
      const input: UpdateCustomerInput['body'] = {
        name: 'John Doe Updated',
      };
      const expectedCustomer = { id: customerId, name: 'John Doe Updated', email: 'john.doe@example.com', address: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.update as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.updateCustomer(customerId, input);

      expect(prisma.customer.update).toHaveBeenCalledWith({ where: { id: customerId }, data: input });
      expect(result).toEqual(expectedCustomer);
    });

    it('should return null if customer to update is not found', async () => {
        const customerId = '999';
        const input: UpdateCustomerInput['body'] = { name: 'Non Existent' };
  
        (prisma.customer.update as jest.Mock).mockRejectedValue(new Error('Record not found'));
  
        const result = await CustomerService.updateCustomer(customerId, input);
  
        expect(result).toBeNull();
      });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const customerId = '1';
      const expectedCustomer = { id: customerId, name: 'John Doe', email: 'john.doe@example.com', address: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.delete as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.deleteCustomer(customerId);

      expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: customerId } });
      expect(result).toEqual(expectedCustomer);
    });

    it('should return null if customer to delete is not found', async () => {
        const customerId = '999';
  
        (prisma.customer.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));
  
        const result = await CustomerService.deleteCustomer(customerId);
  
        expect(result).toBeNull();
      });
  });
});
