import { prisma } from '@/config/database';
import { CreatePackingInput, UpdatePackingInput, SearchPackingInput } from '@/schemas/packing.schema';
import { AppError } from '@/utils/app-error';
import { generatePackingNumber } from '@/utils/random.utils';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class PackingService {
  static async createPacking(packingData: CreatePackingInput): Promise<any> {
    try {
      // Check if purchase order exists
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: packingData.purchaseOrderId },
      });

      if (!purchaseOrder) {
        throw new AppError('Purchase Order not found', 404);
      }

      // Check if packing already exists for this purchase order
      const existingPacking = await prisma.packing.findUnique({
        where: { purchaseOrderId: packingData.purchaseOrderId },
      });

      if (existingPacking) {
        throw new AppError('Packing already exists for this Purchase Order', 409);
      }

      // Generate unique packing number
      let packingNumber: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        packingNumber = generatePackingNumber();
        const existingPackingNumber = await prisma.packing.findUnique({
          where: { packing_number: packingNumber },
        });
        
        if (!existingPackingNumber) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new AppError('Failed to generate unique packing number', 500);
      }

      // Check if status exists
      const status = await prisma.status.findUnique({
        where: { id: packingData.statusId },
      });

      if (!status) {
        throw new AppError('Status not found', 404);
      }

      // Check if all inventories exist
      const inventoryIds = packingData.packingItems.map(item => item.inventoryId);
      const inventories = await prisma.inventory.findMany({
        where: {
          id: {
            in: inventoryIds,
          },
        },
      });

      const foundInventoryIds = new Set(inventories.map(inv => inv.id));
      const missingInventoryIds = inventoryIds.filter(id => !foundInventoryIds.has(id));

      if (missingInventoryIds.length > 0) {
        throw new AppError(`Inventories not found: ${missingInventoryIds.join(', ')}`, 404);
      }

      // Check if all packing item statuses exist (if provided)
      const packingItemStatusIds = packingData.packingItems
        .map(item => item.statusId)
        .filter(Boolean) as string[];
      
      if (packingItemStatusIds.length > 0) {
        const packingItemStatuses = await prisma.status.findMany({
          where: {
            id: {
              in: packingItemStatusIds,
            },
          },
        });

        const foundStatusIds = new Set(packingItemStatuses.map(status => status.id));
        const missingStatusIds = packingItemStatusIds.filter(id => !foundStatusIds.has(id));

        if (missingStatusIds.length > 0) {
          throw new AppError(`Packing item statuses not found: ${missingStatusIds.join(', ')}`, 404);
        }
      }

      // Create packing with items
      return await prisma.packing.create({
        data: {
          packing_number: packingNumber!,
          tanggal_packing: packingData.tanggal_packing,
          statusId: packingData.statusId,
          purchaseOrderId: packingData.purchaseOrderId,
          updatedBy: packingData.updatedBy || 'system', // Default to 'system' if not provided
          packingItems: {
            create: packingData.packingItems,
          },
        },
        include: {
          packingItems: {
            include: {
              status: true,
            }
          },
          purchaseOrder: true,
          status: true,
        },
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create packing', 500);
    }
  }

  static async getAllPackings(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.packing.findMany({
        skip,
        take: parseInt(limit.toString()),
        include: {
          packingItems: {
            include: {
              status: true,
            }
          },
          purchaseOrder: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.packing.count(),
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

  static async getPackingById(id: string): Promise<any | null> {
    return await prisma.packing.findUnique({
      where: { id },
      include: {
        packingItems: {
          include: {
            status: true,
          }
        },
        purchaseOrder: true,
        status: true,
      },
    });
  }

  static async updatePacking(
    id: string,
    data: UpdatePackingInput['body']
  ): Promise<any | null> {
    try {
      const { packingItems, ...packingData } = data;

      return await prisma.$transaction(async (tx) => {
        // Check if the packing exists
        const existingPacking = await tx.packing.findUnique({
          where: { id },
        });

        if (!existingPacking) {
          throw new AppError('Packing not found', 404);
        }

        // If packingItems are provided, validate statuses and handle them
        if (packingItems) {
          // Check if all packing item statuses exist (if provided)
          const packingItemStatusIds = packingItems
            .map(item => item.statusId)
            .filter(Boolean) as string[];
          
          if (packingItemStatusIds.length > 0) {
            const packingItemStatuses = await tx.status.findMany({
              where: {
                id: {
                  in: packingItemStatusIds,
                },
              },
            });

            const foundStatusIds = new Set(packingItemStatuses.map(status => status.id));
            const missingStatusIds = packingItemStatusIds.filter(id => !foundStatusIds.has(id));

            if (missingStatusIds.length > 0) {
              throw new AppError(`Packing item statuses not found: ${missingStatusIds.join(', ')}`, 404);
            }
          }

          await tx.packingItem.deleteMany({
            where: { packingId: id },
          });

          await tx.packingItem.createMany({
            data: packingItems.map((item) => ({
              ...item,
              packingId: id,
            })),
          });
        }

        // Update the Packing itself
        const packing = await tx.packing.update({
          where: { id },
          data: packingData,
          include: {
            packingItems: {
              include: {
                status: true,
              }
            },
            purchaseOrder: true,
            status: true,
          },
        });

        return packing;
      });
    } catch (error) {
      // Re-throw AppError or handle other prisma errors
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update packing', 500);
    }
  }

  static async deletePacking(id: string): Promise<any | null> {
    try {
      return await prisma.packing.delete({
        where: { id },
        include: {
          packingItems: {
            include: {
              status: true,
            }
          },
          purchaseOrder: true,
          status: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async searchPackings(query: SearchPackingInput['query']): Promise<PaginatedResult<any>> {
    const { 
      packing_number,
      tanggal_packing, 
      statusId, 
      purchaseOrderId, 
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    const filters: any[] = [];
    
    if (packing_number) {
      filters.push({
        packing_number: {
          contains: packing_number,
          mode: 'insensitive'
        }
      });
    }
    
    if (tanggal_packing) {
      const date = new Date(tanggal_packing);
      try {
        filters.push({
          tanggal_packing: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          }
        }); 
      } catch (e) {
        // ignore invalid date
      }
    }
    
    if (statusId) {
      filters.push({ statusId });
    }
    
    if (purchaseOrderId) {
      filters.push({ purchaseOrderId });
    }

    const [data, totalItems] = await Promise.all([
      prisma.packing.findMany({
        where: {
          AND: filters.length > 0 ? filters : undefined,
        },
        skip,
        take: parseInt(limit.toString()),
        include: {
          packingItems: {
            include: {
              status: true,
            }
          },
          purchaseOrder: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.packing.count({
        where: {
          AND: filters.length > 0 ? filters : undefined,
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
