import { CustomerService } from '@/services/customer.service';
import { prisma } from '@/config/database';
import { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';
import { AppError } from '@/utils/app-error';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
        namaCustomer: 'John Doe',
        kodeCustomer: 'CUST-001',
        alamatPengiriman: '123 Main St',
        phoneNumber: '1234567890',
        email: 'john.doe@example.com',
        groupCustomerId: 'group1',
        regionId: 'region1',
        createdBy: 'user123',
        updatedBy: 'user123',
      };
      const expectedCustomer = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.create as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.createCustomer(input);

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(expectedCustomer);
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers with pagination', async () => {
      const expectedCustomers = [
        { id: '1', namaCustomer: 'John Doe', email: 'john.doe@example.com', alamatPengiriman: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', namaCustomer: 'Jane Doe', email: 'jane.doe@example.com', alamatPengiriman: '456 Oak Ave', phoneNumber: '0987654321', createdAt: new Date(), updatedAt: new Date() },
      ];
      const paginatedResult = {
        data: expectedCustomers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        }
      };

      (prisma.customer.findMany as jest.Mock).mockResolvedValue(expectedCustomers);
      (prisma.customer.count as jest.Mock).mockResolvedValue(2);

      const result = await CustomerService.getAllCustomers(1, 10);

      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          groupCustomer: true,
          region: true,
        },
      });
      expect(prisma.customer.count).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by id', async () => {
      const customerId = '1';
      const expectedCustomer = { id: customerId, namaCustomer: 'John Doe', email: 'john.doe@example.com', alamatPengiriman: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.getCustomerById(customerId);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: customerId },
        include: {
          purchaseOrders: true,
          groupCustomer: true,
          region: true,
        },
      });
      expect(result).toEqual(expectedCustomer);
    });

    it('should throw an error if customer not found', async () => {
      const customerId = '999';
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(CustomerService.getCustomerById(customerId)).rejects.toThrow(
        new AppError('Customer not found', 404)
      );
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const customerId = '1';
      const input: UpdateCustomerInput['body'] = {
        namaCustomer: 'John Doe Updated',
      };
      const expectedCustomer = { id: customerId, namaCustomer: 'John Doe Updated', email: 'john.doe@example.com', alamatPengiriman: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.update as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.updateCustomer(customerId, input);

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          ...input,
          updatedBy: 'system',
        },
      });
      expect(result).toEqual(expectedCustomer);
    });

    it('should throw an error if customer to update is not found', async () => {
        const customerId = '999';
        const input: UpdateCustomerInput['body'] = { namaCustomer: 'Non Existent' };

        (prisma.customer.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

        await expect(CustomerService.updateCustomer(customerId, input)).rejects.toThrow(
          new AppError('Customer not found', 404)
        );
      });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const customerId = '1';
      const expectedCustomer = { id: customerId, namaCustomer: 'John Doe', email: 'john.doe@example.com', alamatPengiriman: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() };

      (prisma.customer.delete as jest.Mock).mockResolvedValue(expectedCustomer);

      const result = await CustomerService.deleteCustomer(customerId);

      expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: customerId } });
      expect(result).toEqual(expectedCustomer);
    });

    it('should throw an error if customer to delete is not found', async () => {
        const customerId = '999';

        (prisma.customer.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

        await expect(CustomerService.deleteCustomer(customerId)).rejects.toThrow(
          new AppError('Customer not found', 404)
        );
      });
  });

  describe('searchCustomers', () => {
    it('should return customers matching the search query with pagination', async () => {
      const query = 'John';
      const expectedCustomers = [
        { id: '1', namaCustomer: 'John Doe', email: 'john.doe@example.com', alamatPengiriman: '123 Main St', phoneNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() },
      ];
      const paginatedResult = {
        data: expectedCustomers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };

      (prisma.customer.findMany as jest.Mock).mockResolvedValue(expectedCustomers);
      (prisma.customer.count as jest.Mock).mockResolvedValue(1);

      const result = await CustomerService.searchCustomers(query, 1, 10);

      expect(prisma.customer.findMany).toHaveBeenCalled();
      expect(prisma.customer.count).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });
});
