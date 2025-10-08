import { PurchaseOrder, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';
import {
  generatePackingNumber,
  generateUniqueInvoiceNumber,
  generateSuratJalanNumber,
} from '@/utils/random.utils';
import { createAuditLog } from './audit.service';
import { PaginatedResult } from '@/types/common.types';

export interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export class PurchaseOrderService {
  private static async findPurchaseOrdersByPoNumber(
    poNumber: string,
    excludeIds: string[] = [],
    statusId?: string
  ) {
    const whereClause: Prisma.PurchaseOrderWhereInput = {
      po_number: poNumber,
    };

    if (excludeIds.length > 0) {
      whereClause.id = { notIn: excludeIds };
    }

    if (statusId) {
      whereClause.statusId = statusId;
    }

    return prisma.purchaseOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        po_number: true,
        statusId: true,
      },
    });
  }

  static async checkDuplicatePoNumber(poNumber: string, statusId?: string) {
    const matchingPurchaseOrders = await this.findPurchaseOrdersByPoNumber(
      poNumber,
      [],
      statusId
    );

    const matchingCount = matchingPurchaseOrders.length;
    const duplicateCount = matchingCount > 1 ? matchingCount - 1 : 0;
    const duplicateIds = matchingPurchaseOrders.map((po) => po.id);

    return {
      hasDuplicate: duplicateCount > 0,
      matchingCount,
      duplicateCount,
      duplicateIds,
      matchingPurchaseOrders,
    };
  }

  static async createPurchaseOrder(
    poData: CreatePurchaseOrderInput,
    fileInfos: FileInfo[],
    userId: string
  ): Promise<PurchaseOrder> {
    try {
      // Only validate customer if customerId is provided
      if (poData.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: poData.customerId },
        });

        if (!customer) {
          throw new AppError('Customer not found', 404);
        }
      }

      // Get status by status_code or use default
      let statusId: string | undefined;
      if (poData.status_code) {
        const status = await prisma.status.findUnique({
          where: {
            status_code_category: {
              status_code: poData.status_code,
              category: 'Purchase Order',
            },
          },
        });
        if (!status) {
          throw new AppError(
            `Status with code '${poData.status_code}' not found`,
            404
          );
        }
        statusId = status.id;
      } else {
        // Use default status 'PENDING PURCHASE ORDER'
        const defaultStatus = await prisma.status.findUnique({
          where: {
            status_code_category: {
              status_code: 'PENDING PURCHASE ORDER',
              category: 'Purchase Order',
            },
          },
        });
        if (defaultStatus) {
          statusId = defaultStatus.id;
        }
      }

      const { status_code, purchaseOrderDetails, ...poDataWithoutStatus } =
        poData;
      const dataForDb = {
        ...poDataWithoutStatus,
        statusId,
        tanggal_masuk_po: poData.tanggal_masuk_po
          ? new Date(poData.tanggal_masuk_po)
          : new Date(),
        tanggal_batas_kirim: poData.tanggal_batas_kirim
          ? new Date(poData.tanggal_batas_kirim)
          : undefined,
        files: {
          create: fileInfos,
        },
        createdBy: userId,
        updatedBy: userId,
      };

      const purchaseOrder = await prisma.$transaction(async (tx) => {
        const createdPO = await tx.purchaseOrder.create({
          data: dataForDb,
        });

        // Process purchase order details if provided
        if (purchaseOrderDetails && purchaseOrderDetails.length > 0) {
          const processedDetails = await Promise.all(
            purchaseOrderDetails.map(async (detail) => {
              let inventoryId = detail.inventoryId;
              if (!inventoryId) {
                const inventoryItem = await tx.inventory.upsert({
                  where: { plu: detail.plu },
                  create: {
                    plu: detail.plu,
                    nama_barang: detail.nama_barang,
                    stok_c: detail.quantity || 0, // Assuming quantity is in cartons
                    stok_q: 0, // Assuming 0 for pcs stock
                    harga_barang: detail.harga || 0,
                    createdBy: userId,
                    updatedBy: userId,
                  },
                  update: {
                    nama_barang: detail.nama_barang,
                    harga_barang: detail.harga || 0,
                    updatedBy: userId,
                  },
                });
                inventoryId = inventoryItem.id;
              }
              return {
                ...detail,
                inventoryId,
                purchaseOrderId: createdPO.id,
                createdBy: userId,
                updatedBy: userId,
              };
            })
          );

          await tx.purchaseOrderDetail.createMany({
            data: processedDetails.map(({ id, ...rest }) => rest),
          });
        }

        return createdPO;
      });

      await createAuditLog(
        'PurchaseOrder',
        purchaseOrder.id,
        'CREATE',
        userId,
        purchaseOrder
      );

      return purchaseOrder;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('po_number')) {
        throw new AppError(
          'Purchase Order with this PO Number already exists',
          409
        );
      }
      throw error;
    }
  }

  static async getAllPurchaseOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    const statuses = await prisma.status.findMany({
      where: {
        status_code: {
          in: [
            'PENDING PURCHASE ORDER',
            'PROCESSED PURCHASE ORDER',
            'PROCESSING PURCHASE ORDER',
          ],
        },
      },
    });

    const statusIds = statuses.map((status) => status.id);

    const [data, totalItems] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: {
          statusId: {
            in: statusIds,
          },
        },
        skip,
        take: parseInt(limit.toString()),
        include: {
          customer: true,
          supplier: true,
          termOfPayment: true,
          files: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          statusId: {
            in: statusIds,
          },
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

  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        purchaseOrderDetails: true,
        files: true,
        status: true,
        termOfPayment: true,
        packing: {
          include: {
            packingItems: {
              include: {
                inventory: true,
              },
            },
            status: true,
          },
        },
        suratJalan: {
          include: {
            suratJalanDetails: {
              include: {
                suratJalanDetailItems: true,
              },
            },
            status: true,
            checklistSuratJalan: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new AppError('Purchase Order not found', 404);
    }

    if (
      purchaseOrder.po_type === 'AUTO' &&
      (!purchaseOrder.files || purchaseOrder.files.length === 0)
    ) {
      throw new AppError(
        'Data integrity violation: BULK purchase order must have at least one file.',
        500
      );
    }

    // Get audit trail for this purchase order
    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'PurchaseOrder',
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
      ...purchaseOrder,
      auditTrails,
    } as any;
  }

  static async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderInput['body'],
    userId: string
  ): Promise<PurchaseOrder | null> {
    const { purchaseOrderDetails, status_code, ...poData } = data;

    try {
      const updatedPurchaseOrder = await prisma.$transaction(async (tx) => {
        const existingPO = await tx.purchaseOrder.findUnique({
          where: { id },
        });

        if (!existingPO) {
          throw new AppError('Purchase Order not found', 404);
        }

        // Handle status_code if provided
        let statusId: string | undefined;
        if (status_code) {
          const status = await tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: status_code,
                category: 'Purchase Order',
              },
            },
          });
          if (!status) {
            throw new AppError(
              `Status with code '${status_code}' not found`,
              404
            );
          }
          statusId = status.id;
        }

        if (purchaseOrderDetails) {
          await tx.purchaseOrderDetail.deleteMany({
            where: { purchaseOrderId: id },
          });

          const processedDetails = await Promise.all(
            purchaseOrderDetails.map(async (detail) => {
              let inventoryId = detail.inventoryId;
              if (!inventoryId) {
                const inventoryItem = await tx.inventory.upsert({
                  where: { plu: detail.plu },
                  create: {
                    plu: detail.plu,
                    nama_barang: detail.nama_barang,
                    stok_c: detail.quantity || 0, // Assuming quantity is in cartons
                    stok_q: 0, // Assuming 0 for pcs stock
                    harga_barang: detail.harga || 0,
                    createdBy: userId,
                    updatedBy: userId,
                  },
                  update: {
                    nama_barang: detail.nama_barang,
                    harga_barang: detail.harga || 0,
                    updatedBy: userId,
                  },
                });
                inventoryId = inventoryItem.id;
              }
              return {
                ...detail,
                inventoryId,
                purchaseOrderId: id,
                createdBy: userId,
                updatedBy: userId,
              };
            })
          );

          await tx.purchaseOrderDetail.createMany({
            data: processedDetails.map(({ id, ...rest }) => rest),
          });
        }

        const purchaseOrder = await tx.purchaseOrder.update({
          where: { id },
          data: {
            ...poData,
            ...(statusId && { statusId }),
            updatedBy: userId,
          },
          include: {
            purchaseOrderDetails: true,
            customer: true,
            supplier: true,
            status: true,
            files: true,
          },
        });

        await createAuditLog(
          'PurchaseOrder',
          purchaseOrder.id,
          'UPDATE',
          userId,
          {
            before: existingPO,
            after: purchaseOrder,
          }
        );

        return purchaseOrder;
      });

      return updatedPurchaseOrder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating purchase order:', error);
      throw new AppError('Failed to update purchase order', 500);
    }
  }

  static async deletePurchaseOrder(
    id: string,
    userId: string
  ): Promise<PurchaseOrder | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existingPO = await tx.purchaseOrder.findUnique({
          where: { id },
          include: {
            packing: { include: { packingItems: true } },
            invoices: {
              include: {
                suratJalan: {
                  include: {
                    suratJalanDetails: {
                      include: { suratJalanDetailItems: true },
                    },
                    historyPengiriman: true,
                  },
                },
              },
            },
          },
        });

        if (!existingPO) {
          throw new AppError('Purchase Order not found', 404);
        }

        await createAuditLog('PurchaseOrder', id, 'DELETE', userId, existingPO);

        await tx.purchaseOrderDetail.deleteMany({
          where: { purchaseOrderId: id },
        });
        await tx.packingItem.deleteMany({
          where: { packing: { purchaseOrderId: id } },
        });
        await tx.packing.delete({ where: { purchaseOrderId: id } }).catch(() => {});
        await tx.suratJalanDetailItem.deleteMany({
          where: {
            suratJalanDetail: {
              suratJalan: {
                OR: [
                  { invoice: { purchaseOrderId: id } },
                  { purchaseOrderId: id }
                ]
              },
            },
          },
        });
        await tx.suratJalanDetail.deleteMany({
          where: {
            suratJalan: {
              OR: [
                { invoice: { purchaseOrderId: id } },
                { purchaseOrderId: id }
              ]
            }
          },
        });
        await tx.historyPengiriman.deleteMany({
          where: {
            suratJalan: {
              OR: [
                { invoice: { purchaseOrderId: id } },
                { purchaseOrderId: id }
              ]
            }
          },
        });
        await tx.suratJalan.deleteMany({
          where: {
            OR: [
              { invoice: { purchaseOrderId: id } },
              { purchaseOrderId: id }
            ]
          },
        });
        await tx.invoicePengirimanDetail.deleteMany({
          where: { invoice: { purchaseOrderId: id } },
        });
        await tx.invoicePengiriman.deleteMany({
          where: { purchaseOrderId: id },
        });

        return await tx.purchaseOrder.delete({
          where: { id },
          include: {
            customer: true,
            supplier: true,
            files: true,
            status: true,
            purchaseOrderDetails: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error deleting purchase order:', error);
      throw new AppError('Failed to delete purchase order', 500);
    }
  }

  static async getHistoryPurchaseOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    const [approvedStatus, failedStatus] = await Promise.all([
      prisma.status.findUnique({
        where: {
          status_code_category: {
            status_code: 'COMPLETED PURCHASE ORDER',
            category: 'Purchase Order',
          },
        },
      }),
      prisma.status.findUnique({
        where: {
          status_code_category: {
            status_code: 'FAILED PURCHASE ORDER',
            category: 'Purchase Order',
          },
        },
      }),
    ]);

    const statusIds: string[] = [];
    if (approvedStatus) statusIds.push(approvedStatus.id);
    if (failedStatus) statusIds.push(failedStatus.id);

    const [data, totalItems] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: {
          statusId: {
            in: statusIds,
          },
        },
        skip,
        take: parseInt(limit.toString()),
        include: {
          customer: true,
          supplier: true,
          files: true,
          status: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          statusId: {
            in: statusIds,
          },
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

  static async searchPurchaseOrders(
    query: SearchPurchaseOrderInput['query']
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const {
      tanggal_masuk_po,
      customer_name,
      customerId,
      po_number,
      supplierId,
      status_code,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const filters: Prisma.PurchaseOrderWhereInput[] = [];
    if (tanggal_masuk_po) {
      const date = new Date(tanggal_masuk_po);
      try {
        filters.push({
          tanggal_masuk_po: {
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
    if (customer_name) {
      filters.push({
        customer: {
          namaCustomer: { contains: customer_name, mode: 'insensitive' },
        },
      });
    }
    if (customerId) {
      filters.push({ customerId });
    }
    if (po_number) {
      filters.push({ po_number: { contains: po_number, mode: 'insensitive' } });
    }
    if (supplierId) {
      filters.push({ supplierId });
    }
    if (status_code) {
      filters.push({ status: { status_code } });
    }

    const [data, totalItems] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: {
          AND: filters.length > 0 ? filters : undefined,
        },
        skip,
        take: parseInt(limit.toString()),
        include: {
          customer: true,
          supplier: true,
          termOfPayment: true,
          files: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.purchaseOrder.count({
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

  static async processPurchaseOrder(
    ids: string[],
    status_code: string,
    userId: string
  ): Promise<{
    success: PurchaseOrder[];
    failed: {
      id: string;
      error: string;
      duplicateCount?: number;
      duplicateIds?: string[];
      matchingCount?: number;
      poNumber?: string;
    }[];
  }> {
    const results = {
      success: [] as PurchaseOrder[],
      failed: [] as {
        id: string;
        error: string;
        duplicateCount?: number;
        duplicateIds?: string[];
        matchingCount?: number;
        poNumber?: string;
      }[],
    };

    // Process each purchase order individually
    for (const id of ids) {
      try {
        const purchaseOrder = await this.processSinglePurchaseOrder(
          id,
          status_code,
          userId
        );
        results.success.push(purchaseOrder);
      } catch (error: any) {
        const failure = {
          id,
          error: error?.message || 'Unknown error occurred',
        } as {
          id: string;
          error: string;
          duplicateCount?: number;
          duplicateIds?: string[];
          matchingCount?: number;
          poNumber?: string;
        };

        const details = error?.details as Record<string, unknown> | undefined;

        if (details) {
          const duplicateCount = details['duplicateCount'];
          if (typeof duplicateCount === 'number') {
            failure.duplicateCount = duplicateCount;
          }

          const duplicateIds = details['duplicateIds'];
          if (Array.isArray(duplicateIds)) {
            failure.duplicateIds = duplicateIds.filter(
              (value): value is string => typeof value === 'string'
            );
          }

          const matchingCount = details['matchingCount'];
          if (typeof matchingCount === 'number') {
            failure.matchingCount = matchingCount;
          }

          const poNumber = details['poNumber'];
          if (typeof poNumber === 'string') {
            failure.poNumber = poNumber;
          }
        }

        results.failed.push(failure);
      }
    }

    return results;
  }

  private static async processSinglePurchaseOrder(
    id: string,
    status_code: string,
    userId: string
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        purchaseOrderDetails: true,
        customer: true,
      },
    });

    if (!purchaseOrder) {
      throw new AppError('Purchase Order not found', 404);
    }

    const status = await prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: status_code,
          category: 'Purchase Order',
        },
      },
    });

    if (!status) {
      throw new AppError('Status not found', 404);
    }

    const duplicateCheck = await this.checkDuplicatePoNumber(
      purchaseOrder.po_number,
      purchaseOrder.statusId ?? undefined
    );

    if (duplicateCheck.hasDuplicate) {
      throw new AppError(
        'Duplicate PO number detected with the same status. Please resolve duplicates before processing.',
        400,
        {
          poNumber: purchaseOrder.po_number,
          duplicateCount: duplicateCheck.duplicateCount,
          duplicateIds: duplicateCheck.duplicateIds,
          matchingCount: duplicateCheck.matchingCount,
          matchingPurchaseOrders: duplicateCheck.matchingPurchaseOrders,
        }
      );
    }

    const pendingPackingStatus = await prisma.status.findUnique({
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

    const pendingItemStatus = await prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: 'PENDING ITEM',
          category: 'Packing Detail Item',
        },
      },
    });

    if (!pendingItemStatus) {
      throw new AppError('PENDING ITEM status not found', 404);
    }

    return await prisma.$transaction(async (tx) => {
      let createdInvoiceId: string | null = null;
      let createdSuratJalanId: string | null = null;

      let updatedPurchaseOrder = await tx.purchaseOrder.update({
        where: { id },
        data: { statusId: status.id, updatedBy: userId },
        include: {
          purchaseOrderDetails: true,
          customer: true,
          supplier: true,
          status: true,
          files: true,
        },
      });

      if (
        purchaseOrder.purchaseOrderDetails &&
        purchaseOrder.purchaseOrderDetails.length > 0
      ) {
        const existingPacking = await tx.packing.findUnique({
          where: { purchaseOrderId: id },
        });

        if (!existingPacking) {
          const packingItems = purchaseOrder.purchaseOrderDetails.map(
            (detail) => ({
              nama_barang: detail.nama_barang,
              total_qty: detail.quantity,
              jumlah_carton: Math.ceil(detail.quantity / detail.isi),
              isi_per_carton: detail.isi,
              no_box: '',
              inventoryId: detail.inventoryId,
              statusId: pendingItemStatus.id,
              createdBy: userId,
              updatedBy: userId,
            })
          );

          const createdPacking = await tx.packing.create({
            data: {
              packing_number: generatePackingNumber(purchaseOrder.po_number),
              tanggal_packing: new Date(),
              statusId: pendingPackingStatus.id,
              purchaseOrderId: id,
              createdBy: userId,
              updatedBy: userId,
              packingItems: {
                create: packingItems,
              },
            },
          });

          // Create audit log for packing
          await createAuditLog('Packing', createdPacking.id, 'CREATE', userId, {
            action: 'AutoCreatedFromProcessPO',
            purchaseOrderId: id,
            poNumber: purchaseOrder.po_number,
            packingNumber: createdPacking.packing_number,
          });

          const pendingInvoiceStatus = await tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'PENDING INVOICE',
                category: 'Invoice Pengiriman',
              },
            },
          });

          const pendingSuratJalanStatus = await tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'DRAFT SURAT JALAN',
                category: 'Surat Jalan',
              },
            },
          });

          if (!pendingInvoiceStatus) {
            throw new AppError('PENDING INVOICE status not found', 404);
          }

          if (!pendingSuratJalanStatus) {
            throw new AppError('DRAFT SURAT JALAN status not found', 404);
          }

          let createdInvoice = await tx.invoicePengiriman.findFirst({
            where: { purchaseOrderId: id },
          });

          if (!createdInvoice) {
            const invoiceDetails = purchaseOrder.purchaseOrderDetails.map(
              (detail) => {
                const unitPrice = detail.harga || 0;
                const quantity = detail.quantity;
                const total = unitPrice * quantity;

                return {
                  nama_barang: detail.nama_barang,
                  PLU: detail.plu || '',
                  quantity: quantity,
                  satuan: 'pcs',
                  harga: unitPrice,
                  total: total,
                  discount_percentage: 0,
                  discount_rupiah: 0,
                  PPN_pecentage: 0,
                  ppn_rupiah: 0,
                  createdBy: userId,
                  updatedBy: userId,
                };
              }
            );

            const subTotal = invoiceDetails.reduce(
              (sum, detail) => sum + Number(detail.total),
              0
            );
            const grandTotal = subTotal;

            const invoiceNumber = await generateUniqueInvoiceNumber(
              purchaseOrder.po_number,
              async (number: string) => {
                const existingInvoice = await tx.invoicePengiriman.findUnique({
                  where: { no_invoice: number },
                });
                return !existingInvoice;
              }
            );

            createdInvoice = await tx.invoicePengiriman.create({
              data: {
                no_invoice: invoiceNumber,
                tanggal: new Date(),
                deliver_to:
                  purchaseOrder.customer?.namaCustomer || 'Unknown Customer',
                sub_total: subTotal,
                total_discount: 0,
                total_price: subTotal,
                ppn_percentage: 0,
                ppn_rupiah: 0,
                grand_total: grandTotal,
                expired_date: null,
                TOP: '30',
                type: 'PEMBAYARAN',
                statusPembayaranId: pendingInvoiceStatus.id,
                purchaseOrderId: id,
                createdBy: userId,
                updatedBy: userId,
                invoiceDetails: {
                  create: invoiceDetails,
                },
              },
            });

            createdInvoiceId = createdInvoice.id;

            // Create audit log for invoice
            await createAuditLog(
              'InvoicePengiriman',
              createdInvoice.id,
              'CREATE',
              userId,
              {
                action: 'AutoCreatedFromProcessPO',
                purchaseOrderId: id,
                poNumber: purchaseOrder.po_number,
                invoiceNumber: createdInvoice.no_invoice,
                grandTotal: grandTotal,
              }
            );
          } else {
            createdInvoiceId = createdInvoice.id;
          }

          const suratJalanDetails = purchaseOrder.purchaseOrderDetails.map(
            (detail, index) => ({
              no_box: `BOX-${String(index + 1).padStart(3, '0')}`,
              total_quantity_in_box: detail.quantity,
              isi_box: Math.ceil(detail.quantity / detail.isi),
              sisa: 0,
              total_box: Math.ceil(detail.quantity / detail.isi),
              suratJalanDetailItems: {
                create: [
                  {
                    nama_barang: detail.nama_barang,
                    PLU: detail.plu || '',
                    quantity: detail.quantity,
                    satuan: 'pcs',
                    total_box: Math.ceil(detail.quantity / detail.isi),
                    keterangan: `From PO: ${purchaseOrder.po_number}`,
                    createdBy: userId,
                    updatedBy: userId,
                  },
                ],
              },
            })
          );

          let existingSuratJalan = await tx.suratJalan.findFirst({
            where: { invoiceId: createdInvoice.id },
          });

          if (!existingSuratJalan) {
            const suratJalanNumber = generateSuratJalanNumber(
              purchaseOrder.po_number
            );

            const newSuratJalan = await tx.suratJalan.create({
              data: {
                no_surat_jalan: suratJalanNumber,
                deliver_to:
                  purchaseOrder.customer?.namaCustomer || 'Unknown Customer',
                PIC: purchaseOrder.customer?.namaCustomer || 'Unknown PIC',
                alamat_tujuan:
                  purchaseOrder.customer?.alamatPengiriman || 'Unknown Address',
                is_printed: false,
                print_counter: 0,
                invoiceId: createdInvoice.id,
                purchaseOrderId: id,
                statusId: pendingSuratJalanStatus.id,
                createdBy: userId,
                updatedBy: userId,
                suratJalanDetails: {
                  create: suratJalanDetails,
                },
              },
            });

            if (newSuratJalan) {
              createdSuratJalanId = newSuratJalan.id;

              // Create audit log for surat jalan
              await createAuditLog(
                'SuratJalan',
                newSuratJalan.id,
                'CREATE',
                userId,
                {
                  action: 'AutoCreatedFromProcessPO',
                  purchaseOrderId: id,
                  poNumber: purchaseOrder.po_number,
                  suratJalanNumber: newSuratJalan.no_surat_jalan,
                  invoiceId: createdInvoice.id,
                }
              );
            }
          } else {
            createdSuratJalanId = existingSuratJalan.id;
          }
        }

        if (createdInvoiceId || createdSuratJalanId) {
          updatedPurchaseOrder = await tx.purchaseOrder.update({
            where: { id },
            data: {
              updatedBy: userId,
            },
            include: {
              purchaseOrderDetails: true,
              customer: true,
              supplier: true,
              status: true,
              files: true,
            },
          });
        }
      }

      await createAuditLog(
        'PurchaseOrder',
        updatedPurchaseOrder.id,
        'UPDATE',
        userId,
        {
          action: 'ProcessPurchaseOrder',
          status: status_code,
          result: updatedPurchaseOrder,
        }
      );

      return updatedPurchaseOrder;
    });
  }
}
