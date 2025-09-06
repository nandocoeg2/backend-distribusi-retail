import { Customer, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateCustomerInput, UpdateCustomerInput, GetAllCustomersInput } from '@/schemas/customer.schema';
import { AppError } from '@/utils/app-error';
import { PaginatedResult } from './purchase-order.service';

export class CustomerService {
  static async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    try {
      return await prisma.customer.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Customer with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllCustomers(page: number = 1, limit: number = 10): Promise<PaginatedResult<Customer>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.customer.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
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

  static async searchCustomers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Customer>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      const [data, totalItems] = await Promise.all([
        prisma.customer.findMany({
          skip,
          take: parseInt(limit.toString()),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.customer.count(),
      ]);
      
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    }

    const filters: Prisma.CustomerWhereInput[] = [
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
    ];

    const [data, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.customer.count({
        where: {
          OR: filters,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }
}
