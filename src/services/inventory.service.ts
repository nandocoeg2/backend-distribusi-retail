import { prisma } from '@/config/database';
import { Inventory, Prisma } from '@prisma/client';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';

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
    return service.createEntity(input, userId);
  }

  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> {
    const service = new InventoryService();
    return service.getAllEntities(page, limit);
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

    return service.searchEntities(filters, page, limit);
  }

  static async getById(id: string) {
    const service = new InventoryService();
    return service.getEntityById(id);
  }

  static async update(id: string, data: UpdateInventoryInput['body'], userId: string) {
    const service = new InventoryService();
    return service.updateEntity(id, data, userId);
  }

  static async delete(id: string, userId: string) {
    const service = new InventoryService();
    return service.deleteEntity(id, userId);
  }
}
