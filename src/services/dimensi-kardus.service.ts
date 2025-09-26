import { prisma } from '@/config/database';
import { DimensiKardus, Prisma } from '@prisma/client';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';
import { CreateDimensiKardusInput, UpdateDimensiKardusInput } from '@/schemas/dimensi-kardus.schema';

export class DimensiKardusService extends BaseService<
  DimensiKardus,
  CreateDimensiKardusInput,
  UpdateDimensiKardusInput['body']
> {
  protected modelName = 'DimensiKardus';
  protected tableName = 'DimensiKardus';
  protected prismaModel = prisma.dimensiKardus;

  static async create(input: CreateDimensiKardusInput, userId: string) {
    const service = new DimensiKardusService();
    return service.createEntity(input, userId);
  }

  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<DimensiKardus>> {
    const service = new DimensiKardusService();
    return service.getAllEntities(page, limit, { inventory: true });
  }

  static async search(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<DimensiKardus>> {
    const service = new DimensiKardusService();
    if (!query) {
      return service.getAllEntities(page, limit, { inventory: true });
    }

    const filters: Prisma.DimensiKardusWhereInput[] = [
      {
        inventory: {
          OR: [
            { nama_barang: { contains: query, mode: 'insensitive' } },
            { plu: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
    ];

    return service.searchEntities(filters, page, limit, { inventory: true });
  }

  static async getById(id: string) {
    const service = new DimensiKardusService();
    return service.getEntityById(id, { inventory: true });
  }

  static async update(id: string, data: UpdateDimensiKardusInput['body'], userId: string) {
    const service = new DimensiKardusService();
    return service.updateEntity(id, data, userId);
  }

  static async delete(id: string, userId: string) {
    const service = new DimensiKardusService();
    return service.deleteEntity(id, userId);
  }
}


