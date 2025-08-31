import { Supplier } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { CreateSupplierInput, UpdateSupplierInput, SearchSupplierInput } from '@/schemas/supplier.schema';

export class SupplierService {
  static async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    try {
      return await prisma.supplier.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllSuppliers(): Promise<Supplier[]> {
    return prisma.supplier.findMany();
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
      return await prisma.supplier.update({
        where: { id },
        data,
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

  static async searchSuppliers(query?: string): Promise<Supplier[]> {
    if (!query) {
      return prisma.supplier.findMany();
    }

    return prisma.supplier.findMany({
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
          {
            code: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
}
