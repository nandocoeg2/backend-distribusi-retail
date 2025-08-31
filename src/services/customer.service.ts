import { Customer } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';

export class CustomerService {
  static async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }

  static async getAllCustomers(): Promise<Customer[]> {
    return prisma.customer.findMany();
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
      },
    });
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput['body']): Promise<Customer | null> {
    try {
      return await prisma.customer.update({
        where: { id },
        data,
      });
    } catch (error) {
      // Prisma throws an error if the record is not found on update
      return null;
    }
  }

  static async deleteCustomer(id: string): Promise<Customer | null> {
    try {
      return await prisma.customer.delete({
        where: { id },
      });
    } catch (error) {
      // Prisma throws an error if the record is not found on delete
      return null;
    }
  }

  static async searchCustomers(query?: string): Promise<Customer[]> {
    if (!query) {
      return prisma.customer.findMany();
    }

    return prisma.customer.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phoneNumber: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
}
