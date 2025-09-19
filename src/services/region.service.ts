import { Region, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateRegionInput, UpdateRegionInput } from '../schemas/region.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';

export class RegionService extends BaseService<
  Region,
  CreateRegionInput,
  UpdateRegionInput['body']
> {
  protected modelName = 'Region';
  protected tableName = 'Region';
  protected prismaModel = prisma.region;

  static async createRegion(data: CreateRegionInput, userId: string): Promise<Region> {
    const service = new RegionService();
    
    const preprocessData = (data: CreateRegionInput, userId: string) => {
      const { createdBy, updatedBy, ...regionData } = data;
      return {
        ...regionData,
        createdBy: userId,
        updatedBy: userId,
      };
    };

    return service.createEntity(data, userId, preprocessData);
  }

  static async getAllRegions(page: number = 1, limit: number = 10): Promise<PaginatedResult<Region>> {
    const service = new RegionService();
    return service.getAllEntities(page, limit);
  }

  static async getRegionById(id: string) {
    const service = new RegionService();
    return service.getEntityById(id);
  }

  static async updateRegion(id: string, data: UpdateRegionInput['body'], userId: string): Promise<Region> {
    const service = new RegionService();
    
    const preprocessData = (data: UpdateRegionInput['body'], userId: string) => {
      const { updatedBy, ...regionData } = data;
      return {
        ...regionData,
        updatedBy: userId,
      };
    };

    return service.updateEntity(id, data, userId, preprocessData);
  }

  static async deleteRegion(id: string, userId: string): Promise<Region> {
    const service = new RegionService();
    return service.deleteEntity(id, userId);
  }

  static async searchRegions(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Region>> {
    const service = new RegionService();
    
    if (!query) {
      return service.getAllEntities(page, limit);
    }

    const filters: Prisma.RegionWhereInput[] = [
      {
        kode_region: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        nama_region: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    return service.searchEntities(filters, page, limit);
  }
}
