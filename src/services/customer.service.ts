import { Customer, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';
import { AppError } from '@/utils/app-error';
import { PaginatedResult } from './purchase-order.service';

export class CustomerService {
  static async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    try {
      const { createdBy, updatedBy, ...customerData } = data;
      
      return await prisma.customer.create({
        data: {
          ...customerData,
          createdBy: createdBy || 'system',
          updatedBy: updatedBy || 'system',
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('kodeCustomer')) {
        throw new AppError('Customer with this code already exists', 409);
      }
      if (error.code === 'P2003') {
        const field = error.meta?.field_name as string;
        if (field.includes('groupCustomerId')) {
          throw new AppError('Group Customer not found', 404);
        }
        if (field.includes('regionId')) {
          throw new AppError('Region not found', 404);
        }
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
        include: {
          groupCustomer: true,
          region: true,
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

  static async getCustomerById(id: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
        groupCustomer: true,
        region: true,
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput['body']): Promise<Customer> {
    try {
      const { updatedBy, ...customerData } = data;
      
      return await prisma.customer.update({
        where: { id },
        data: {
          ...customerData,
          updatedBy: updatedBy || 'system',
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        const field = error.meta?.field_name as string;
        if (field.includes('groupCustomerId')) {
          throw new AppError('Group Customer not found', 404);
        }
        if (field.includes('regionId')) {
          throw new AppError('Region not found', 404);
        }
      }
      if (error.code === 'P2025') {
        throw new AppError('Customer not found', 404);
      }
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<Customer> {
    try {
      return await prisma.customer.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('Customer not found', 404);
      }
      throw error;
    }
  }

  static async searchCustomers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Customer>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllCustomers(page, limit);
    }

    const filters: Prisma.CustomerWhereInput[] = [
      {
        namaCustomer: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        kodeCustomer: {
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
        alamatPengiriman: {
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
        include: {
          groupCustomer: true,
          region: true,
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
