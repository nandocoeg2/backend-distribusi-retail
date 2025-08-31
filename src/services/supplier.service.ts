import { Supplier } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';

export class SupplierService {
  static async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
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
    } catch (error) {
      // Prisma throws an error if the record is not found on update
      return null;
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
        ],
      },
    });
  }
}

