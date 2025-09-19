import { Supplier, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';

export class SupplierService extends BaseService<
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput['body']
> {
  protected modelName = 'Supplier';
  protected tableName = 'Supplier';
  protected prismaModel = prisma.supplier;

  static async createSupplier(data: CreateSupplierInput, userId: string): Promise<Supplier> {
    const service = new SupplierService();
    
    const preprocessData = (data: CreateSupplierInput, userId: string) => {
      const { createdBy, updatedBy, ...supplierData } = data;
      return {
        ...supplierData,
        createdBy: userId,
        updatedBy: userId,
      };
    };

    return service.createEntity(data, userId, preprocessData);
  }

  static async getAllSuppliers(page: number = 1, limit: number = 10): Promise<PaginatedResult<Supplier>> {
    const service = new SupplierService();
    return service.getAllEntities(page, limit);
  }

  static async getSupplierById(id: string): Promise<Supplier | null> {
    const service = new SupplierService();
    const include = {
      purchaseOrders: {
        include: {
          purchaseOrderDetails: true
        },
      },
    };
    
    return service.getEntityById(id, include) as any;
  }

  static async updateSupplier(id: string, data: UpdateSupplierInput['body'], userId: string): Promise<Supplier | null> {
    const service = new SupplierService();
    
    const preprocessData = (data: UpdateSupplierInput['body'], userId: string) => {
      const { updatedBy, ...supplierData } = data;
      return {
        ...supplierData,
        updatedBy: userId,
      };
    };

    return service.updateEntity(id, data, userId, preprocessData);
  }

  static async deleteSupplier(id: string, userId: string): Promise<Supplier | null> {
    const service = new SupplierService();
    return service.deleteEntity(id, userId);
  }

  static async searchSuppliers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Supplier>> {
    const service = new SupplierService();
    
    if (!query) {
      return service.getAllEntities(page, limit);
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

    return service.searchEntities(filters, page, limit);
  }
}
