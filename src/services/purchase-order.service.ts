import { PurchaseOrder, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';
import { generatePackingNumber, generateUniqueInvoiceNumber, generateSuratJalanNumber } from '@/utils/random.utils';
import { createAuditLog } from './audit.service';

export interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class PurchaseOrderService {
  static async createPurchaseOrder(
    poData: CreatePurchaseOrderInput,
    fileInfos: FileInfo[],
    userId: string
  ): Promise<PurchaseOrder> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: poData.customerId },
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const dataForDb = {
        ...poData,
        tanggal_order: poData.tanggal_order ? new Date(poData.tanggal_order) : new Date(),
        files: {
          create: fileInfos,
        },
        createdBy: userId,
        updatedBy: userId,
      };

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: dataForDb,
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

  static async getAllPurchaseOrders(page: number = 1, limit: number = 10): Promise<PaginatedResult<PurchaseOrder>> {
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

    const statusIds = statuses.map(status => status.id);

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
        packings: {
          include: {
            packingItems: {
              include: {
                inventory: true,
              },
            },
            status: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new AppError('Purchase Order not found', 404);
    }

    if (purchaseOrder.po_type === 'BULK' && (!purchaseOrder.files || purchaseOrder.files.length === 0)) {
      throw new AppError('Data integrity violation: BULK purchase order must have at least one file.', 500);
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
    const { purchaseOrderDetails, ...poData } = data;

    try {
      const updatedPurchaseOrder = await prisma.$transaction(async (tx) => {
        const existingPO = await tx.purchaseOrder.findUnique({
          where: { id },
        });

        if (!existingPO) {
          throw new AppError('Purchase Order not found', 404);
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
          data: { ...poData, updatedBy: userId },
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
            packings: { include: { packingItems: true } },
            invoices: { include: { suratJalan: { include: { suratJalanDetails: { include: { suratJalanDetailItems: true } }, historyPengiriman: true } } } },
          },
        });

        if (!existingPO) {
          throw new AppError('Purchase Order not found', 404);
        }

        await createAuditLog('PurchaseOrder', id, 'DELETE', userId, existingPO);

        await tx.purchaseOrderDetail.deleteMany({ where: { purchaseOrderId: id } });
        await tx.packingItem.deleteMany({ where: { packing: { purchaseOrderId: id } } });
        await tx.packing.deleteMany({ where: { purchaseOrderId: id } });
        await tx.suratJalanDetailItem.deleteMany({ where: { suratJalanDetail: { suratJalan: { invoice: { purchaseOrderId: id } } } } });
        await tx.suratJalanDetail.deleteMany({ where: { suratJalan: { invoice: { purchaseOrderId: id } } } });
        await tx.historyPengiriman.deleteMany({ where: { suratJalan: { invoice: { purchaseOrderId: id } } } });
        await tx.suratJalan.deleteMany({ where: { invoice: { purchaseOrderId: id } } });
        await tx.invoiceDetail.deleteMany({ where: { invoice: { purchaseOrderId: id } } });
        await tx.invoice.deleteMany({ where: { purchaseOrderId: id } });

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

  static async getHistoryPurchaseOrders(page: number = 1, limit: number = 10): Promise<PaginatedResult<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    const [approvedStatus, failedStatus] = await Promise.all([
      prisma.status.findUnique({ where: { status_code: 'APPROVED PURCHASE ORDER' } }),
      prisma.status.findUnique({ where: { status_code: 'FAILED PURCHASE ORDER' } }),
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

  static async searchPurchaseOrders(query: SearchPurchaseOrderInput['query']): Promise<PaginatedResult<PurchaseOrder>> {
    const { 
      tanggal_order, 
      customer_name, 
      customerId, 
      suratPO, 
      invoicePengiriman, 
      po_number, 
      supplierId, 
      statusId,
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    const filters: Prisma.PurchaseOrderWhereInput[] = [];
    if (tanggal_order) {
      const date = new Date(tanggal_order);
      try {
        filters.push({
          tanggal_order: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          }
        }); 
      } catch (e) {
        // ignore invalid date
      }
    }
    if (customer_name) {
      filters.push({ customer: { namaCustomer: { contains: customer_name, mode: 'insensitive' } } });
    }
    if (customerId) {
      filters.push({ customerId });
    }
    if (suratPO) {
      filters.push({ suratPO: { contains: suratPO, mode: 'insensitive' } });
    }
    if (invoicePengiriman) {
      filters.push({ invoicePengiriman: { contains: invoicePengiriman, mode: 'insensitive' } });
    }
    if (po_number) {
      filters.push({ po_number: { contains: po_number, mode: 'insensitive' } });
    }
    if (supplierId) {
      filters.push({ supplierId });
    }
    if (statusId) {
      filters.push({ statusId });
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
      where: { status_code: status_code },
    });

    if (!status) {
      throw new AppError('Status not found', 404);
    }

    const pendingPackingStatus = await prisma.status.findUnique({
      where: { status_code: 'PENDING PACKING' },
    });

    if (!pendingPackingStatus) {
      throw new AppError('PENDING PACKING status not found', 404);
    }

    const pendingItemStatus = await prisma.status.findUnique({
      where: { status_code: 'PENDING ITEM' },
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

      if (purchaseOrder.purchaseOrderDetails && purchaseOrder.purchaseOrderDetails.length > 0) {
        const existingPacking = await tx.packing.findUnique({
          where: { purchaseOrderId: id },
        });

        if (!existingPacking) {
          const packingItems = purchaseOrder.purchaseOrderDetails.map(detail => ({
            nama_barang: detail.nama_barang,
            total_qty: detail.quantity,
            jumlah_carton: Math.ceil(detail.quantity / detail.isi),
            isi_per_carton: detail.isi,
            no_box: '',
            inventoryId: detail.inventoryId,
            statusId: pendingItemStatus.id,
            createdBy: userId,
            updatedBy: userId,
          }));

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
            where: { status_code: 'PENDING INVOICE' },
          });

          const pendingSuratJalanStatus = await tx.status.findUnique({
            where: { status_code: 'PENDING SURAT JALAN' },
          });

          if (!pendingInvoiceStatus) {
            throw new AppError('PENDING INVOICE status not found', 404);
          }

          if (!pendingSuratJalanStatus) {
            throw new AppError('PENDING SURAT JALAN status not found', 404);
          }

          let createdInvoice = await tx.invoice.findFirst({
            where: { purchaseOrderId: id },
          });

          if (!createdInvoice) {
            const invoiceDetails = purchaseOrder.purchaseOrderDetails.map(detail => {
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
            });

            const subTotal = invoiceDetails.reduce((sum, detail) => sum + Number(detail.total), 0);
            const grandTotal = subTotal;

            const invoiceNumber = await generateUniqueInvoiceNumber(
              purchaseOrder.po_number,
              async (number: string) => {
                const existingInvoice = await tx.invoice.findUnique({
                  where: { no_invoice: number },
                });
                return !existingInvoice;
              }
            );

            createdInvoice = await tx.invoice.create({
              data: {
                no_invoice: invoiceNumber,
                tanggal: new Date(),
                deliver_to: purchaseOrder.customer?.namaCustomer || 'Unknown Customer',
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
            await createAuditLog('Invoice', createdInvoice.id, 'CREATE', userId, {
              action: 'AutoCreatedFromProcessPO',
              purchaseOrderId: id,
              poNumber: purchaseOrder.po_number,
              invoiceNumber: createdInvoice.no_invoice,
              grandTotal: grandTotal,
            });
          } else {
            createdInvoiceId = createdInvoice.id;
          }

          const suratJalanDetails = purchaseOrder.purchaseOrderDetails.map((detail, index) => ({
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
          }));

          let existingSuratJalan = await tx.suratJalan.findFirst({
            where: { invoiceId: createdInvoice.id },
          });

          if (!existingSuratJalan) {
            const suratJalanNumber = generateSuratJalanNumber(purchaseOrder.po_number);
            
            const newSuratJalan = await tx.suratJalan.create({
              data: {
                no_surat_jalan: suratJalanNumber,
                deliver_to: purchaseOrder.customer?.namaCustomer || 'Unknown Customer',
                PIC: purchaseOrder.customer?.namaCustomer || 'Unknown PIC',
                alamat_tujuan: purchaseOrder.customer?.alamatPengiriman || 'Unknown Address',
                is_printed: false,
                print_counter: 0,
                invoiceId: createdInvoice.id,
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
              await createAuditLog('SuratJalan', newSuratJalan.id, 'CREATE', userId, {
                action: 'AutoCreatedFromProcessPO',
                purchaseOrderId: id,
                poNumber: purchaseOrder.po_number,
                suratJalanNumber: newSuratJalan.no_surat_jalan,
                invoiceId: createdInvoice.id,
              });
            }
          } else {
            createdSuratJalanId = existingSuratJalan.id;
          }
        }
        
        if (createdInvoiceId || createdSuratJalanId) {
          updatedPurchaseOrder = await tx.purchaseOrder.update({
            where: { id },
            data: {
              ...(createdInvoiceId && { invoicePengiriman: createdInvoiceId }),
              ...(createdSuratJalanId && { suratJalan: createdSuratJalanId }),
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
