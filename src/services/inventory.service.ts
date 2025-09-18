import { prisma } from '@/config/database';
import { Inventory, Prisma } from '@prisma/client';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';
import { createAuditLog } from './audit.service';
import { AppError } from '@/utils/app-error';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class InventoryService {
  static async create(input: CreateInventoryInput, userId: string) {
    const inventory = await prisma.inventory.create({
      data: {
        ...input,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await createAuditLog('Inventory', inventory.id, 'CREATE', userId, inventory);

    return inventory;
  }

  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.inventory.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.inventory.count(),
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

  static async search(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> {
    const skip = (page - 1) * limit;

    if (!query) {
      return this.getAll(page, limit);
    }

    const filters: Prisma.InventoryWhereInput[] = [
      {
        nama_barang: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        kode_barang: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.inventory.count({
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

  static async getById(id: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'Inventory',
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
      ...inventory,
      auditTrails,
    };
  }

  static async update(id: string, data: UpdateInventoryInput['body'], userId: string) {
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      throw new AppError('Inventory not found', 404);
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });

    await createAuditLog('Inventory', updatedInventory.id, 'UPDATE', userId, {
      before: existingInventory,
      after: updatedInventory,
    });

    return updatedInventory;
  }

  static async delete(id: string, userId: string) {
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      throw new AppError('Inventory not found', 404);
    }

    await createAuditLog('Inventory', id, 'DELETE', userId, existingInventory);

    return prisma.inventory.delete({
      where: { id },
    });
  }
}
