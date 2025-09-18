import { ItemPrice, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateItemPriceInput, UpdateItemPriceInput } from '../schemas/item-price.schema';
import { AppError } from '../utils/app-error';
import { PaginatedResult } from './purchase-order.service';
import { createAuditLog } from './audit.service';

export class ItemPriceService {
  static async createItemPrice(data: CreateItemPriceInput, userId: string): Promise<ItemPrice> {
    try {
      const { createdBy, updatedBy, ...itemPriceData } = data;

      const itemPrice = await prisma.itemPrice.create({
        data: {
          ...itemPriceData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('ItemPrice', itemPrice.id, 'CREATE', userId, itemPrice);

      return itemPrice;
    } catch (error: any) {
      throw error;
    }
  }

  static async getAllItemPrices(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemPrice>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.itemPrice.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.itemPrice.count(),
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

  static async getItemPriceById(id: string) {
    const itemPrice = await prisma.itemPrice.findUnique({
      where: { id },
    });

    if (!itemPrice) {
      throw new AppError('ItemPrice not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'ItemPrice',
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
      ...itemPrice,
      auditTrails,
    };
  }

  static async updateItemPrice(id: string, data: UpdateItemPriceInput['body'], userId: string): Promise<ItemPrice> {
    const existingItemPrice = await prisma.itemPrice.findUnique({
      where: { id },
    });

    if (!existingItemPrice) {
      throw new AppError('ItemPrice not found', 404);
    }

    const { updatedBy, ...itemPriceData } = data;

    const updatedItemPrice = await prisma.itemPrice.update({
      where: { id },
      data: {
        ...itemPriceData,
        updatedBy: userId,
      },
    });

    await createAuditLog('ItemPrice', updatedItemPrice.id, 'UPDATE', userId, {
      before: existingItemPrice,
      after: updatedItemPrice,
    });

    return updatedItemPrice;
  }

  static async deleteItemPrice(id: string, userId: string): Promise<ItemPrice> {
    const existingItemPrice = await prisma.itemPrice.findUnique({
      where: { id },
    });

    if (!existingItemPrice) {
      throw new AppError('ItemPrice not found', 404);
    }

    await createAuditLog('ItemPrice', id, 'DELETE', userId, existingItemPrice);

    return await prisma.itemPrice.delete({
      where: { id },
    });
  }

  static async searchItemPrices(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemPrice>> {
    const skip = (page - 1) * limit;

    if (!query) {
      return this.getAllItemPrices(page, limit);
    }

    const filters: Prisma.ItemPriceWhereInput[] = [
      {
        inventory: {
          nama_barang: {
            contains: query,
            mode: 'insensitive',
          }
        }
      },
      {
        customer: {
          namaCustomer: {
            contains: query,
            mode: 'insensitive',
          }
        }
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.itemPrice.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.itemPrice.count({
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
