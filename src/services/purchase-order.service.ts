import { PurchaseOrder, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';
import { generatePackingNumber } from '@/utils/packing.utils';

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
    fileInfos: FileInfo[]
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
        tanggal_order: new Date(poData.tanggal_order),
        files: {
          create: fileInfos,
        },
      };

      return await prisma.purchaseOrder.create({
        data: dataForDb,
      });
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

    // Get status IDs
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

    if (purchaseOrder && purchaseOrder.po_type === 'BULK' && (!purchaseOrder.files || purchaseOrder.files.length === 0)) {
      throw new AppError('Data integrity violation: BULK purchase order must have at least one file.', 500);
    }

    return purchaseOrder;
  }

  static async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderInput['body']
  ): Promise<PurchaseOrder | null> {
    const { purchaseOrderDetails, ...poData } = data;

    try {
      const updatedPurchaseOrder = await prisma.$transaction(async (tx) => {
        // 1. Check if the purchase order exists
        const existingPO = await tx.purchaseOrder.findUnique({
          where: { id },
        });

        if (!existingPO) {
          throw new AppError('Purchase Order not found', 404);
        }

        // 2. If purchaseOrderDetails are provided, delete old ones and create new ones
        if (purchaseOrderDetails) {
          await tx.purchaseOrderDetail.deleteMany({
            where: { purchaseOrderId: id },
          });

          await tx.purchaseOrderDetail.createMany({
            data: purchaseOrderDetails.map((detail) => ({
              ...detail,
              purchaseOrderId: id,
            })),
          });
        }

        // 3. Update the PurchaseOrder itself
        const purchaseOrder = await tx.purchaseOrder.update({
          where: { id },
          data: poData,
          include: {
            purchaseOrderDetails: true,
            customer: true,
            supplier: true,
            status: true,
            files: true,
          },
        });

        return purchaseOrder;
      });

      return updatedPurchaseOrder;
    } catch (error) {
      // Re-throw AppError or handle other prisma errors
      if (error instanceof AppError) {
        throw error;
      }
      // Log the error for debugging
      console.error('Error updating purchase order:', error);
      // You might want to throw a generic error or handle it as needed
      throw new AppError('Failed to update purchase order', 500);
    }
  }

  static async deletePurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    try {
      return await prisma.purchaseOrder.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }

  static async getHistoryPurchaseOrders(page: number = 1, limit: number = 10): Promise<PaginatedResult<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    // Get status IDs for "APPROVED PURCHASE ORDER" and "FAILED PURCHASE ORDER"
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
      filters.push({ customer: { name: { contains: customer_name, mode: 'insensitive' } } });
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
    userId: string = 'system'
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

    // Check if PENDING PACKING status exists
    const pendingPackingStatus = await prisma.status.findUnique({
      where: { status_code: 'PENDING PACKING' },
    });

    if (!pendingPackingStatus) {
      throw new AppError('PENDING PACKING status not found', 404);
    }

    // Check if PENDING ITEM status exists for packing items
    const pendingItemStatus = await prisma.status.findUnique({
      where: { status_code: 'PENDING ITEM' },
    });

    if (!pendingItemStatus) {
      throw new AppError('PENDING ITEM status not found', 404);
    }

    return await prisma.$transaction(async (tx) => {
      // Update purchase order status
      const updatedPurchaseOrder = await tx.purchaseOrder.update({
        where: { id },
        data: { statusId: status.id },
        include: {
          purchaseOrderDetails: true,
          customer: true,
          supplier: true,
          status: true,
          files: true,
        },
      });

      // Create packing record, invoice, and surat jalan
      if (purchaseOrder.purchaseOrderDetails && purchaseOrder.purchaseOrderDetails.length > 0) {
        // Check if packing already exists for this purchase order
        const existingPacking = await tx.packing.findUnique({
          where: { purchaseOrderId: id },
        });

        if (!existingPacking) {
          // Create packing items from purchase order details with status
          const packingItems = purchaseOrder.purchaseOrderDetails.map(detail => ({
            nama_barang: detail.nama_barang,
            total_qty: detail.quantity,
            jumlah_carton: Math.ceil(detail.quantity / detail.isi), // Calculate cartons
            isi_per_carton: detail.isi,
            no_box: '', // Will be filled later during actual packing
            inventoryId: detail.inventoryId,
            statusId: pendingItemStatus.id, // PENDING ITEM status for packing items
          }));

          // Create packing record
          const createdPacking = await tx.packing.create({
            data: {
              packing_number: generatePackingNumber(), // Generate unique packing number
              tanggal_packing: new Date(), // Current date/time
              statusId: pendingPackingStatus.id, // PENDING PACKING status
              purchaseOrderId: id,
              updatedBy: userId, // User who processed the purchase order
              packingItems: {
                create: packingItems,
              },
            },
          });

          // Get status for invoice and surat jalan
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

          // Create invoice with details from purchase order
          const invoiceDetails = purchaseOrder.purchaseOrderDetails.map(detail => {
            const unitPrice = detail.harga || 0;
            const quantity = detail.quantity;
            const total = unitPrice * quantity;
            
            return {
              nama_barang: detail.nama_barang,
              PLU: detail.kode_barang || '',
              quantity: quantity,
              satuan: 'pcs', // Default unit since satuan is not in PurchaseOrderDetail
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
          const grandTotal = subTotal; // No discount or tax for now

          // Generate invoice number based on current date and purchase order
          const currentDate = new Date();
          const invoiceNumber = `INV-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${purchaseOrder.po_number}`;

          const createdInvoice = await tx.invoice.create({
            data: {
              no_invoice: invoiceNumber,
              tanggal: new Date(),
              deliver_to: purchaseOrder.customer?.name || 'Unknown Customer',
              sub_total: subTotal,
              total_discount: 0,
              total_price: subTotal,
              ppn_percentage: 0,
              ppn_rupiah: 0,
              grand_total: grandTotal,
              expired_date: null, // Can be set based on business logic
              TOP: '30', // Default 30 days
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

          // Create surat jalan details from packing items
          const suratJalanDetails = packingItems.map((item, index) => ({
            no_box: `BOX-${String(index + 1).padStart(3, '0')}`,
            total_quantity_in_box: item.total_qty,
            isi_box: item.jumlah_carton,
            sisa: 0, // Initially no remaining items
            total_box: item.jumlah_carton,
            items: [
              {
                nama_barang: item.nama_barang,
                PLU: purchaseOrder.purchaseOrderDetails?.find(pd => pd.nama_barang === item.nama_barang)?.kode_barang || '',
                quantity: item.total_qty,
                satuan: 'pcs', // Default unit since satuan is not in PurchaseOrderDetail
                total_box: item.jumlah_carton,
                keterangan: `From Purchase Order: ${purchaseOrder.po_number}`,
                createdBy: userId,
                updatedBy: userId,
              },
            ],
          }));

          // Generate surat jalan number
          const suratJalanNumber = `SJ-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${purchaseOrder.po_number}`;

          // Create surat jalan with status
          await tx.suratJalan.create({
            data: {
              no_surat_jalan: suratJalanNumber,
              deliver_to: purchaseOrder.customer?.name || 'Unknown Customer',
              PIC: purchaseOrder.customer?.name || 'Unknown PIC',
              alamat_tujuan: purchaseOrder.customer?.address || 'Unknown Address',
              is_printed: false,
              print_counter: 0,
              invoiceId: createdInvoice.id,
              statusId: pendingSuratJalanStatus.id, // PENDING SURAT JALAN status
              suratJalanDetails: {
                create: suratJalanDetails.map(detail => ({
                  no_box: detail.no_box,
                  total_quantity_in_box: detail.total_quantity_in_box,
                  isi_box: detail.isi_box,
                  sisa: detail.sisa,
                  total_box: detail.total_box,
                  suratJalanDetailItems: {
                    create: detail.items,
                  },
                })),
              },
            },
          });
        }
      }

      return updatedPurchaseOrder;
    });
  }
}
