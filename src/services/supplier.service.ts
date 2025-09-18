import { Supplier, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';
import { PaginatedResult } from './purchase-order.service';
import { createAuditLog } from './audit.service';

export class SupplierService {
  static async createSupplier(data: CreateSupplierInput, userId: string): Promise<Supplier> {
    try {
      const { createdBy, updatedBy, ...supplierData } = data;
      
      const supplier = await prisma.supplier.create({
        data: {
          ...supplierData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('Supplier', supplier.id, 'CREATE', userId, supplier);

      return supplier;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      throw new AppError('Error creating supplier', 500);
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
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            purchaseOrderDetails: true
          },
        },
      },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'Supplier',
        recordId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return {
      ...supplier,
      auditTrails,
    } as any;
  }

  static async updateSupplier(id: string, data: UpdateSupplierInput['body'], userId: string): Promise<Supplier | null> {
    try {
      const existingSupplier = await prisma.supplier.findUnique({ where: { id } });
      if (!existingSupplier) {
        throw new AppError('Supplier not found', 404);
      }

      const { updatedBy, ...supplierData } = data;
      
      const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: {
          ...supplierData,
          updatedBy: userId,
        },
      });

      await createAuditLog('Supplier', updatedSupplier.id, 'UPDATE', userId, {
        before: existingSupplier,
        after: updatedSupplier,
      });

      return updatedSupplier;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      throw new AppError('Error updating supplier', 500);
    }
  }

  static async deleteSupplier(id: string, userId: string): Promise<Supplier | null> {
    try {
      const existingSupplier = await prisma.supplier.findUnique({ where: { id } });
      if (!existingSupplier) {
        throw new AppError('Supplier not found', 404);
      }

      await createAuditLog('Supplier', id, 'DELETE', userId, existingSupplier);

      return await prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error deleting supplier', 500);
    }
  }

  static async searchSuppliers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Supplier>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllSuppliers(page, limit);
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
