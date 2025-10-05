import { prisma } from '@/config/database';
import {
  CreatePackingInput,
  UpdatePackingInput,
  SearchPackingInput,
} from '@/schemas/packing.schema';
import { AppError } from '@/utils/app-error';
import { generateUniquePackingNumber } from '@/utils/random.utils';
import { createAuditLog } from './audit.service';
import { PaginatedResult } from '@/types/common.types';

export class PackingService {
  static async createPacking(
    packingData: CreatePackingInput,
    userId: string
  ): Promise<any> {
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
        throw new AppError(
          'Packing already exists for this Purchase Order',
          409
        );
      }

      // Generate unique packing number using standardized approach
      const packingNumber = await generateUniquePackingNumber(
        async (number: string) => {
          const existingPackingNumber = await prisma.packing.findUnique({
            where: { packing_number: number },
          });
          return !existingPackingNumber; // Return true if unique (no existing packing)
        },
        purchaseOrder.po_number
      );

      // Check if status exists
      const status = await prisma.status.findUnique({
        where: { id: packingData.statusId },
      });

      if (!status) {
        throw new AppError('Status not found', 404);
      }

      // Check if all inventories exist
      const inventoryIds = packingData.packingItems.map(
        (item) => item.inventoryId
      );
      const inventories = await prisma.inventory.findMany({
        where: {
          id: {
            in: inventoryIds,
          },
        },
      });

      const foundInventoryIds = new Set(inventories.map((inv) => inv.id));
      const missingInventoryIds = inventoryIds.filter(
        (id) => !foundInventoryIds.has(id)
      );

      if (missingInventoryIds.length > 0) {
        throw new AppError(
          `Inventories not found: ${missingInventoryIds.join(', ')}`,
          404
        );
      }

      // Check if all packing item statuses exist (if provided)
      const packingItemStatusIds = packingData.packingItems
        .map((item) => item.statusId)
        .filter(Boolean) as string[];

      if (packingItemStatusIds.length > 0) {
        const packingItemStatuses = await prisma.status.findMany({
          where: {
            id: {
              in: packingItemStatusIds,
            },
          },
        });

        const foundStatusIds = new Set(
          packingItemStatuses.map((status) => status.id)
        );
        const missingStatusIds = packingItemStatusIds.filter(
          (id) => !foundStatusIds.has(id)
        );

        if (missingStatusIds.length > 0) {
          throw new AppError(
            `Packing item statuses not found: ${missingStatusIds.join(', ')}`,
            404
          );
        }
      }

      // Create packing with items
      const newPacking = await prisma.packing.create({
        data: {
          packing_number: packingNumber!,
          tanggal_packing: packingData.tanggal_packing,
          statusId: packingData.statusId,
          purchaseOrderId: packingData.purchaseOrderId,
          createdBy: userId,
          updatedBy: userId,
          packingItems: {
            create: packingData.packingItems.map((item) => ({
              ...item,
              createdBy: userId,
              updatedBy: userId,
            })),
          },
        },
        include: {
          packingItems: {
            include: {
              status: true,
            },
          },
          purchaseOrder: true,
          status: true,
        },
      });

      await createAuditLog(
        'Packing',
        newPacking.id,
        'CREATE',
        userId,
        newPacking
      );

      return newPacking;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create packing', 500);
    }
  }

  static async getAllPackings(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.packing.findMany({
        skip,
        take: parseInt(limit.toString()),
        include: {
          packingItems: {
            include: {
              status: true,
            },
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
    const packing = await prisma.packing.findUnique({
      where: { id },
      include: {
        packingItems: {
          include: {
            status: true,
          },
        },
        purchaseOrder: true,
        status: true,
      },
    });

    if (!packing) {
      throw new AppError('Packing not found', 404);
    }

    // Get audit trail for this packing
    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'Packing',
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
      ...packing,
      auditTrails,
    };
  }

  static async updatePacking(
    id: string,
    data: UpdatePackingInput['body'],
    userId: string
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
            .map((item) => item.statusId)
            .filter(Boolean) as string[];

          if (packingItemStatusIds.length > 0) {
            const packingItemStatuses = await tx.status.findMany({
              where: {
                id: {
                  in: packingItemStatusIds,
                },
              },
            });

            const foundStatusIds = new Set(
              packingItemStatuses.map((status) => status.id)
            );
            const missingStatusIds = packingItemStatusIds.filter(
              (id) => !foundStatusIds.has(id)
            );

            if (missingStatusIds.length > 0) {
              throw new AppError(
                `Packing item statuses not found: ${missingStatusIds.join(
                  ', '
                )}`,
                404
              );
            }
          }

          await tx.packingItem.deleteMany({
            where: { packingId: id },
          });

          await tx.packingItem.createMany({
            data: packingItems.map((item) => ({
              ...item,
              packingId: id,
              createdBy: userId,
              updatedBy: userId,
            })),
          });
        }

        // Update the Packing itself
        const updatedPacking = await tx.packing.update({
          where: { id },
          data: { ...packingData, updatedBy: userId },
          include: {
            packingItems: {
              include: {
                status: true,
              },
            },
            purchaseOrder: true,
            status: true,
          },
        });

        await createAuditLog('Packing', updatedPacking.id, 'UPDATE', userId, {
          before: existingPacking,
          after: updatedPacking,
        });

        return updatedPacking;
      });
    } catch (error) {
      // Re-throw AppError or handle other prisma errors
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update packing', 500);
    }
  }

  static async deletePacking(id: string, userId: string): Promise<any | null> {
    try {
      const existingPacking = await prisma.packing.findUnique({
        where: { id },
      });

      if (!existingPacking) {
        return null;
      }

      await createAuditLog('Packing', id, 'DELETE', userId, existingPacking);

      return await prisma.packing.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete packing', 500);
    }
  }

  static async searchPackings(
    query: SearchPackingInput['query']
  ): Promise<PaginatedResult<any>> {
    const {
      packing_number,
      tanggal_packing,
      status_code,
      purchaseOrderId,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const filters: any[] = [];

    if (packing_number) {
      filters.push({
        packing_number: {
          contains: packing_number,
          mode: 'insensitive',
        },
      });
    }

    if (tanggal_packing) {
      const date = new Date(tanggal_packing);
      try {
        filters.push({
          tanggal_packing: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lte: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + 1
            ),
          },
        });
      } catch (e) {
        // ignore invalid date
      }
    }

    if (status_code) {
      filters.push({
        status: {
          status_code: {
            equals: status_code,
            mode: 'insensitive',
          },
        },
      });
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
            },
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

  static async processPacking(ids: string[], userId: string): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Validasi bahwa semua packing ada
        const packings = await tx.packing.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            packingItems: true,
            status: true,
            purchaseOrder: {
              include: {
                status: true,
              },
            },
          },
        });

        if (packings.length !== ids.length) {
          const foundIds = packings.map((p) => p.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          throw new AppError(
            `Packing not found: ${missingIds.join(', ')}`,
            404
          );
        }

        // Validasi bahwa semua packing memiliki status "PENDING PACKING"
        const pendingPackingStatus = await tx.status.findUnique({
          where: {
            status_code_category: {
              status_code: 'PENDING PACKING',
              category: 'Packing',
            },
          },
        });

        if (!pendingPackingStatus) {
          throw new AppError('PENDING PACKING status not found', 404);
        }

        const invalidPackings = packings.filter(
          (p) => p.statusId !== pendingPackingStatus.id
        );
        if (invalidPackings.length > 0) {
          const invalidIds = invalidPackings.map((p) => p.id);
          throw new AppError(
            `Packing dengan ID ${invalidIds.join(
              ', '
            )} tidak memiliki status PENDING PACKING`,
            400
          );
        }

        // Validasi semua packing memiliki purchase order dengan status PROCESSING PURCHASE ORDER
        for (const packing of packings) {
          if (!packing.purchaseOrderId) {
            throw new AppError(
              `Packing dengan ID ${packing.id} tidak memiliki Purchase Order`,
              400
            );
          }

          if (
            !packing.purchaseOrder ||
            !packing.purchaseOrder.status ||
            packing.purchaseOrder.status.status_code !==
              'PROCESSING PURCHASE ORDER'
          ) {
            throw new AppError(
              `Purchase Order untuk Packing ${packing.id} harus memiliki status PROCESSING PURCHASE ORDER`,
              400
            );
          }
        }

        // Ambil status "PROCESSING PACKING" dan "PROCESSING ITEM"
        const [processingPackingStatus, processingItemStatus] =
          await Promise.all([
            tx.status.findUnique({
              where: {
                status_code_category: {
                  status_code: 'PROCESSING PACKING',
                  category: 'Packing',
                },
              },
            }),
            tx.status.findUnique({
              where: {
                status_code_category: {
                  status_code: 'PROCESSING ITEM',
                  category: 'Packing Detail Item',
                },
              },
            }),
          ]);

        if (!processingPackingStatus || !processingItemStatus) {
          throw new AppError('Required statuses not found', 404);
        }

        // Update status packing menjadi "PROCESSING PACKING"
        const updatedPackings = await tx.packing.updateMany({
          where: {
            id: { in: ids },
          },
          data: {
            statusId: processingPackingStatus.id,
            updatedBy: userId,
          },
        });

        // Update status semua packingItem menjadi "PROCESSING ITEM"
        const updatedPackingItems = await tx.packingItem.updateMany({
          where: {
            packingId: { in: ids },
          },
          data: {
            statusId: processingItemStatus.id,
            updatedBy: userId,
          },
        });

        // Ambil data packing yang sudah diupdate untuk response
        const resultPackings = await tx.packing.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            packingItems: {
              include: {
                status: true,
              },
            },
            purchaseOrder: true,
            status: true,
          },
        });

        // Buat audit log untuk setiap packing
        for (const packing of resultPackings) {
          await createAuditLog('Packing', packing.id, 'UPDATE', userId, {
            action: 'PROCESS_PACKING',
            before: { statusId: pendingPackingStatus.id },
            after: { statusId: processingPackingStatus.id },
          });
        }

        // Buat audit log untuk setiap purchase order yang terkait
        const uniquePurchaseOrderIds = [
          ...new Set(
            resultPackings
              .map((p) => p.purchaseOrderId)
              .filter(Boolean) as string[]
          ),
        ];

        for (const poId of uniquePurchaseOrderIds) {
          const purchaseOrder = await tx.purchaseOrder.findUnique({
            where: { id: poId },
            include: {
              status: true,
              packings: {
                include: {
                  status: true,
                },
              },
            },
          });

          if (purchaseOrder) {
            await createAuditLog(
              'PurchaseOrder',
              purchaseOrder.id,
              'UPDATE',
              userId,
              {
                action: 'PACKING_PROCESSED',
                packingIds: resultPackings
                  .filter((p) => p.purchaseOrderId === poId)
                  .map((p) => p.id),
              }
            );
          }
        }

        return {
          message: 'Packing berhasil diproses',
          processedCount: updatedPackings.count,
          processedPackingItemsCount: updatedPackingItems.count,
          packings: resultPackings,
        };
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process packing', 500);
    }
  }

  static async completePacking(
    ids: string[],
    userId: string
  ): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Validasi bahwa semua packing ada
        const packings = await tx.packing.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            packingItems: true,
            status: true,
            purchaseOrder: {
              include: {
                status: true,
              },
            },
          },
        });

        if (packings.length !== ids.length) {
          const foundIds = packings.map((p) => p.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          throw new AppError(
            `Packing not found: ${missingIds.join(', ')}`,
            404
          );
        }

        // Validasi bahwa semua packing memiliki status "PROCESSING PACKING"
        const processingPackingStatus = await tx.status.findUnique({
          where: {
            status_code_category: {
              status_code: 'PROCESSING PACKING',
              category: 'Packing',
            },
          },
        });

        if (!processingPackingStatus) {
          throw new AppError('PROCESSING PACKING status not found', 404);
        }

        const invalidPackings = packings.filter(
          (p) => p.statusId !== processingPackingStatus.id
        );
        if (invalidPackings.length > 0) {
          const invalidIds = invalidPackings.map((p) => p.id);
          throw new AppError(
            `Packing dengan ID ${invalidIds.join(
              ', '
            )} tidak memiliki status PROCESSING PACKING`,
            400
          );
        }

        // Validasi semua packing memiliki purchase order dengan status PROCESSING PURCHASE ORDER
        for (const packing of packings) {
          if (!packing.purchaseOrderId) {
            throw new AppError(
              `Packing dengan ID ${packing.id} tidak memiliki Purchase Order`,
              400
            );
          }

          if (
            !packing.purchaseOrder ||
            !packing.purchaseOrder.status ||
            packing.purchaseOrder.status.status_code !==
              'PROCESSING PURCHASE ORDER'
          ) {
            throw new AppError(
              `Purchase Order untuk Packing ${packing.id} harus memiliki status PROCESSING PURCHASE ORDER`,
              400
            );
          }
        }

        // Ambil status "COMPLETED PACKING", "PROCESSED ITEM", dan "PROCESSED PURCHASE ORDER"
        const [
          completedPackingStatus,
          processedItemStatus,
          processedPurchaseOrderStatus,
        ] = await Promise.all([
          tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'COMPLETED PACKING',
                category: 'Packing',
              },
            },
          }),
          tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'PROCESSED ITEM',
                category: 'Packing Detail Item',
              },
            },
          }),
          tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'PROCESSED PURCHASE ORDER',
                category: 'Purchase Order',
              },
            },
          }),
        ]);

        if (
          !completedPackingStatus ||
          !processedItemStatus ||
          !processedPurchaseOrderStatus
        ) {
          throw new AppError('Required statuses not found', 404);
        }

        // Update status semua packingItem menjadi "PROCESSED ITEM"
        const updatedPackingItems = await tx.packingItem.updateMany({
          where: {
            packingId: { in: ids },
          },
          data: {
            statusId: processedItemStatus.id,
            updatedBy: userId,
          },
        });

        // Update status packing menjadi "COMPLETED PACKING"
        const updatedPackings = await tx.packing.updateMany({
          where: {
            id: { in: ids },
          },
          data: {
            statusId: completedPackingStatus.id,
            updatedBy: userId,
          },
        });

        // Update status purchase order menjadi "PROCESSED PURCHASE ORDER"
        const uniquePurchaseOrderIds = [
          ...new Set(
            packings.map((p) => p.purchaseOrderId).filter(Boolean) as string[]
          ),
        ];

        await tx.purchaseOrder.updateMany({
          where: {
            id: { in: uniquePurchaseOrderIds },
          },
          data: {
            statusId: processedPurchaseOrderStatus.id,
            updatedBy: userId,
          },
        });

        // Ambil data packing yang sudah diupdate untuk response
        const resultPackings = await tx.packing.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            packingItems: {
              include: {
                status: true,
              },
            },
            purchaseOrder: {
              include: {
                status: true,
              },
            },
            status: true,
          },
        });

        // Buat audit log untuk setiap packing
        for (const packing of resultPackings) {
          await createAuditLog('Packing', packing.id, 'UPDATE', userId, {
            action: 'COMPLETE_PACKING',
            before: { statusId: processingPackingStatus.id },
            after: { statusId: completedPackingStatus.id },
          });
        }

        // Buat audit log untuk setiap purchase order yang terkait
        for (const poId of uniquePurchaseOrderIds) {
          const purchaseOrder = await tx.purchaseOrder.findUnique({
            where: { id: poId },
            include: {
              status: true,
              packings: {
                include: {
                  status: true,
                },
              },
            },
          });

          if (purchaseOrder) {
            await createAuditLog(
              'PurchaseOrder',
              purchaseOrder.id,
              'UPDATE',
              userId,
              {
                action: 'PACKING_COMPLETED',
                before: { status_code: 'PROCESSING PURCHASE ORDER' },
                after: { status_code: 'PROCESSED PURCHASE ORDER' },
                packingIds: resultPackings
                  .filter((p) => p.purchaseOrderId === poId)
                  .map((p) => p.id),
              }
            );
          }
        }

        return {
          message: 'Packing berhasil diselesaikan',
          completedCount: updatedPackings.count,
          completedPackingItemsCount: updatedPackingItems.count,
          packings: resultPackings,
        };
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to complete packing', 500);
    }
  }
}
