import { Region, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateRegionInput, UpdateRegionInput } from '../schemas/region.schema';
import { AppError } from '../utils/app-error';
import { PaginatedResult } from './purchase-order.service';
import { createAuditLog } from './audit.service';

export class RegionService {
  static async createRegion(data: CreateRegionInput, userId: string): Promise<Region> {
    try {
      const { createdBy, updatedBy, ...regionData } = data;
      
      const region = await prisma.region.create({
        data: {
          ...regionData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('Region', region.id, 'CREATE', userId, region);
      
      return region;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('kode_region')) {
        throw new AppError('Region with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllRegions(page: number = 1, limit: number = 10): Promise<PaginatedResult<Region>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.region.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.region.count(),
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

  static async getRegionById(id: string) {
    const region = await prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      throw new AppError('Region not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'Region',
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
      ...region,
      auditTrails,
    };
  }

  static async updateRegion(id: string, data: UpdateRegionInput['body'], userId: string): Promise<Region> {
    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      throw new AppError('Region not found', 404);
    }

    const { updatedBy, ...regionData } = data;

    const updatedRegion = await prisma.region.update({
      where: { id },
      data: {
        ...regionData,
        updatedBy: userId,
      },
    });

    await createAuditLog('Region', updatedRegion.id, 'UPDATE', userId, {
      before: existingRegion,
      after: updatedRegion,
    });

    return updatedRegion;
  }

  static async deleteRegion(id: string, userId: string): Promise<Region> {
    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      throw new AppError('Region not found', 404);
    }

    await createAuditLog('Region', id, 'DELETE', userId, existingRegion);

    return await prisma.region.delete({
      where: { id },
    });
  }

  static async searchRegions(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Region>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllRegions(page, limit);
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

    const [data, totalItems] = await Promise.all([
      prisma.region.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.region.count({
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
