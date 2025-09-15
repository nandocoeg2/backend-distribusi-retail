import { Supplier, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { CreateSupplierInput, UpdateSupplierInput, SearchSupplierInput, GetAllSuppliersInput } from '@/schemas/supplier.schema';
import { PaginatedResult } from './purchase-order.service';

export class SupplierService {
  static async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    try {
      // Extract audit fields if present
      const { createdBy, updatedBy, ...supplierData } = data;
      
      return await prisma.supplier.create({
        data: {
          ...supplierData,
          createdBy: createdBy || 'system',
          updatedBy: updatedBy || 'system',
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllSuppliers(page: number = 1, limit: number = 10): Promise<PaginatedResult<Supplier>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.supplier.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.supplier.count(),
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

  static async getSupplierById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            purchaseOrderDetails: true
          },
        },
      },
    });
  }

  static async updateSupplier(id: string, data: UpdateSupplierInput['body']): Promise<Supplier | null> {
    try {
      // Extract audit fields if present
      const { updatedBy, ...supplierData } = data;
      
      return await prisma.supplier.update({
        where: { id },
        data: {
          ...supplierData,
          updatedBy: updatedBy || 'system',
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  static async deleteSupplier(id: string): Promise<Supplier | null> {
    try {
      return await prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      // Prisma throws an error if the record is not found on delete
      return null;
    }
  }

  static async searchSuppliers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Supplier>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      const [data, totalItems] = await Promise.all([
        prisma.supplier.findMany({
          skip,
          take: parseInt(limit.toString()),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.supplier.count(),
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

    const filters: Prisma.SupplierWhereInput[] = [
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
      {
        code: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.supplier.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.supplier.count({
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
