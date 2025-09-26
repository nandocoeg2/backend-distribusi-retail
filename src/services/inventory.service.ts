import { prisma } from '@/config/database';
import { Inventory, Prisma } from '@prisma/client';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';
import { createAuditLog } from './audit.service';
import { AppError } from '@/utils/app-error';

export class InventoryService extends BaseService<
  Inventory,
  CreateInventoryInput,
  UpdateInventoryInput['body']
> {
  protected modelName = 'Inventory';
  protected tableName = 'Inventory';
  protected prismaModel = prisma.inventory;

  static async create(input: CreateInventoryInput, userId: string) {
    const service = new InventoryService();
    
    // Extract dimensi kardus fields from input
    const { berat, panjang, lebar, tinggi, ...inventoryData } = input;
    
    try {
      // Create inventory with nested dimensi kardus creation
      const result = await prisma.inventory.create({
        data: {
          ...inventoryData,
          createdBy: userId,
          updatedBy: userId,
          dimensiKardus: {
            create: {
              berat: berat || 0,
              panjang: panjang || 0,
              lebar: lebar || 0,
              tinggi: tinggi || 0,
              createdBy: userId,
              updatedBy: userId,
            },
          },
        },
        include: { dimensiKardus: true },
      });

      // Create audit log for inventory creation
      await createAuditLog('Inventory', result.id, 'CREATE', userId, result);

      return result;
    } catch (error: any) {
      throw new AppError('Failed to create inventory with dimensi kardus', 500);
    }
  }

  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> {
    const service = new InventoryService();
    return service.getAllEntities(page, limit, { dimensiKardus: true });
  }

  static async search(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> {
    const service = new InventoryService();
    
    if (!query) {
      return service.getAllEntities(page, limit);
    }

    const filters: Prisma.InventoryWhereInput[] = [
      {
        nama_barang: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        plu: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    return service.searchEntities(filters, page, limit, { dimensiKardus: true });
  }

  static async getById(id: string) {
    const service = new InventoryService();
    return service.getEntityById(id, { dimensiKardus: true });
  }

  static async update(id: string, data: UpdateInventoryInput['body'], userId: string) {
    const service = new InventoryService();
    
    // Extract dimensi kardus fields from input
    const { berat, panjang, lebar, tinggi, ...inventoryData } = data;
    
    try {
      // Check if inventory exists
      const existingInventory = await prisma.inventory.findUnique({
        where: { id },
        include: { dimensiKardus: true },
      });

      if (!existingInventory) {
        throw new AppError('Inventory not found', 404);
      }

      // Prepare dimensi kardus update data
      const dimensiFields = { berat, panjang, lebar, tinggi };
      const hasDimensiFields = Object.values(dimensiFields).some(value => value !== undefined);
      
      const dimensiUpdateData = hasDimensiFields ? {
        dimensiKardus: {
          update: {
            ...(berat !== undefined && { berat }),
            ...(panjang !== undefined && { panjang }),
            ...(lebar !== undefined && { lebar }),
            ...(tinggi !== undefined && { tinggi }),
            updatedBy: userId,
          },
        },
      } : {};

      // Update inventory with nested dimensi kardus update
      const result = await prisma.inventory.update({
        where: { id },
        data: {
          ...inventoryData,
          updatedBy: userId,
          ...dimensiUpdateData,
        },
        include: { dimensiKardus: true },
      });

      // Create audit log for inventory update
      await createAuditLog('Inventory', result.id, 'UPDATE', userId, {
        before: existingInventory,
        after: result,
      });

      return result;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update inventory', 500);
    }
  }

  static async delete(id: string, userId: string) {
    const service = new InventoryService();
    return service.deleteEntity(id, userId);
  }
}
