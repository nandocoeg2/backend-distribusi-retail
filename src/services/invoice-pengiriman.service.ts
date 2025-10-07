import { InvoicePengiriman, InvoicePenagihan, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateInvoicePengirimanInput,
  UpdateInvoicePengirimanInput,
  SearchInvoicePengirimanInput,
} from '@/schemas/invoice-pengiriman.schema';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from './audit.service';
import { PaginatedResult } from '@/types/common.types';
import { generateUniqueDocumentNumber, DOCUMENT_CONFIGS } from '@/utils/random.utils';

export class InvoicePengirimanService {
  static async createInvoice(
    invoiceData: CreateInvoicePengirimanInput,
    userId: string
  ): Promise<InvoicePengiriman> {
    try {
      const { invoiceDetails, ...invoiceInfo } = invoiceData;

      const newInvoice = await prisma.invoicePengiriman.create({
        data: {
          ...invoiceInfo,
          tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : new Date(),
          expired_date: invoiceInfo.expired_date ? new Date(invoiceInfo.expired_date) : null,
          createdBy: userId,
          updatedBy: userId,
          invoiceDetails: invoiceDetails
            ? {
                create: invoiceDetails.map((detail) => ({
                  ...detail,
                  createdBy: userId,
                  updatedBy: userId,
                })),
              }
            : undefined,
        },
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
          invoicePenagihan: {
            include: {
              status: true,
              termOfPayment: true,
            },
          },
        },
      });

      await createAuditLog('InvoicePengiriman', newInvoice.id, 'CREATE', userId, newInvoice);

      return newInvoice;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('no_invoice')) {
        throw new AppError('InvoicePengiriman with this number already exists', 409);
      }
      throw error;
    }
  }

  static async getAllInvoices(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<InvoicePengiriman>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.invoicePengiriman.findMany({
        skip,
        take: parseInt(limit.toString()),
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
          invoicePenagihan: {
            include: {
              status: true,
              termOfPayment: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoicePengiriman.count(),
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

  static async getInvoiceById(id: string): Promise<InvoicePengiriman | null> {
    const invoice = await prisma.invoicePengiriman.findUnique({
      where: { id },
      include: {
        invoiceDetails: true,
        statusPembayaran: true,
        purchaseOrder: {
          include: {
            customer: true,
            supplier: true,
          },
        },
        suratJalan: true,
        invoicePenagihan: {
          include: {
            status: true,
            termOfPayment: true,
            invoicePenagihanDetails: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError('InvoicePengiriman not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'InvoicePengiriman',
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
      ...invoice,
      auditTrails,
    } as any;
  }

  static async updateInvoice(
    id: string,
    data: UpdateInvoicePengirimanInput['body'],
    userId: string
  ): Promise<InvoicePengiriman | null> {
    const { invoiceDetails, ...invoiceInfo } = data;

    try {
      const updatedInvoice = await prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoicePengiriman.findUnique({
          where: { id },
        });

        if (!existingInvoice) {
          throw new AppError('InvoicePengiriman not found', 404);
        }

        if (invoiceDetails) {
          await tx.invoicePengirimanDetail.deleteMany({
            where: { invoiceId: id },
          });

          await tx.invoicePengirimanDetail.createMany({
            data: invoiceDetails.map((detail) => ({
              ...detail,
              invoiceId: id,
              createdBy: userId,
              updatedBy: userId,
            })),
          });
        }

        const invoice = await tx.invoicePengiriman.update({
          where: { id },
          data: {
            ...invoiceInfo,
            tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : undefined,
            expired_date: invoiceInfo.expired_date ? new Date(invoiceInfo.expired_date) : null,
            updatedBy: userId,
          },
          include: {
            invoiceDetails: true,
            statusPembayaran: true,
            purchaseOrder: true,
            invoicePenagihan: {
              include: {
                status: true,
                termOfPayment: true,
              },
            },
          },
        });

        await createAuditLog('InvoicePengiriman', invoice.id, 'UPDATE', userId, {
          before: existingInvoice,
          after: invoice,
        });

        return invoice;
      });

      return updatedInvoice;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating InvoicePengiriman:', error);
      throw new AppError('Failed to update InvoicePengiriman', 500);
    }
  }

  static async deleteInvoice(id: string, userId: string): Promise<InvoicePengiriman | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoicePengiriman.findUnique({
          where: { id },
        });

        if (!existingInvoice) {
          throw new AppError('InvoicePengiriman not found', 404);
        }

        await createAuditLog('InvoicePengiriman', id, 'DELETE', userId, existingInvoice);

        await tx.invoicePengirimanDetail.deleteMany({
          where: { invoiceId: id },
        });

        return await tx.invoicePengiriman.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error deleting InvoicePengiriman:', error);
      throw new AppError('Failed to delete InvoicePengiriman', 500);
    }
  }

  static async searchInvoices(
    query: SearchInvoicePengirimanInput['query']
  ): Promise<PaginatedResult<InvoicePengiriman>> {
    const {
      no_invoice,
      deliver_to,
      type,
      status_code,
      purchaseOrderId,
      tanggal_start,
      tanggal_end,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const filters: Prisma.InvoicePengirimanWhereInput[] = [];

    if (no_invoice) {
      filters.push({ no_invoice: { contains: no_invoice, mode: 'insensitive' } });
    }
    if (deliver_to) {
      filters.push({ deliver_to: { contains: deliver_to, mode: 'insensitive' } });
    }
    if (type) {
      filters.push({ type: type as 'PEMBAYARAN' | 'PENGIRIMAN' });
    }
    if (status_code) {
      filters.push({
        statusPembayaran: {
          is: {
            status_code,
          },
        },
      });
    }
    if (purchaseOrderId) {
      filters.push({ purchaseOrderId });
    }
    if (tanggal_start || tanggal_end) {
      const dateFilter: any = {};
      if (tanggal_start) {
        dateFilter.gte = new Date(tanggal_start);
      }
      if (tanggal_end) {
        dateFilter.lte = new Date(tanggal_end);
      }
      filters.push({ tanggal: dateFilter });
    }

    const [data, totalItems] = await Promise.all([
      prisma.invoicePengiriman.findMany({
        where: {
          AND: filters.length > 0 ? filters : undefined,
        },
        skip,
        take: parseInt(limit.toString()),
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: {
            include: {
              customer: true,
            },
          },
          invoicePenagihan: {
            include: {
              status: true,
              termOfPayment: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoicePengiriman.count({
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

  static async createPenagihan(
    invoicePengirimanId: string,
    statusId: string | undefined,
    userId: string
  ): Promise<InvoicePenagihan> {
    try {
      // 1. Query InvoicePengiriman dengan relasi
      const invoicePengiriman = await prisma.invoicePengiriman.findUnique({
        where: { id: invoicePengirimanId },
        include: {
          purchaseOrder: true,
          invoiceDetails: true,
        },
      });

      if (!invoicePengiriman) {
        throw new AppError('InvoicePengiriman not found', 404);
      }

      // 2. Validasi purchaseOrder dan termin_bayar
      if (!invoicePengiriman.purchaseOrder) {
        throw new AppError('PurchaseOrder not found for this InvoicePengiriman', 404);
      }

      if (!invoicePengiriman.purchaseOrder.termin_bayar) {
        throw new AppError('Term of Payment (termin_bayar) not found in PurchaseOrder', 400);
      }

      // 3. Cek apakah sudah ada InvoicePenagihan yang terhubung
      if (invoicePengiriman.invoicePenagihanId) {
        throw new AppError('InvoicePenagihan already exists for this InvoicePengiriman', 409);
      }

      // 4. Generate unique invoice number
      const checkUniqueCallback = async (invoiceNumber: string) => {
        const existing = await prisma.invoicePenagihan.findUnique({
          where: { no_invoice_penagihan: invoiceNumber }
        });
        return !existing;
      };

      const invoiceNumber = await generateUniqueDocumentNumber(
        {
          ...DOCUMENT_CONFIGS.INVOICE,
          prefix: 'IPN'
        },
        checkUniqueCallback,
        invoicePengiriman.purchaseOrderId || undefined
      );

      // 5. Tentukan statusId (gunakan parameter atau default)
      let finalStatusId = statusId;
      if (!finalStatusId) {
        // Cari status default untuk invoice penagihan (PENDING)
        const defaultStatus = await prisma.status.findFirst({
          where: {
            category: 'Invoice Penagihan',
            status_code: 'PENDING INVOICE PENAGIHAN'
          }
        });
        if (!defaultStatus) {
          throw new AppError('Default status "PENDING INVOICE PENAGIHAN" not found. Please provide statusId or create status with category "Invoice Penagihan" and status_code "PENDING INVOICE PENAGIHAN"', 400);
        }
        finalStatusId = defaultStatus.id;
      }

      // 6. Transaction: Create InvoicePenagihan dan update InvoicePengiriman
      const result = await prisma.$transaction(async (tx) => {
        // Create InvoicePenagihan
        const newInvoicePenagihan = await tx.invoicePenagihan.create({
          data: {
            no_invoice_penagihan: invoiceNumber,
            purchaseOrderId: invoicePengiriman.purchaseOrderId!,
            kw: false,
            fp: false,
            tanggal: new Date(),
            kepada: invoicePengiriman.deliver_to,
            sub_total: invoicePengiriman.sub_total,
            total_discount: invoicePengiriman.total_discount,
            total_price: invoicePengiriman.total_price,
            ppn_percentage: invoicePengiriman.ppn_percentage,
            ppn_rupiah: invoicePengiriman.ppn_rupiah,
            grand_total: invoicePengiriman.grand_total,
            termOfPaymentId: invoicePengiriman.purchaseOrder!.termin_bayar!,
            statusId: finalStatusId,
            createdBy: userId,
            updatedBy: userId,
            invoicePenagihanDetails: {
              create: invoicePengiriman.invoiceDetails.map((detail) => ({
                nama_barang: detail.nama_barang,
                PLU: detail.PLU,
                quantity: detail.quantity,
                satuan: detail.satuan,
                harga: detail.harga,
                total: detail.total,
                discount_percentage: detail.discount_percentage,
                discount_rupiah: detail.discount_rupiah,
                createdBy: userId,
                updatedBy: userId,
              })),
            },
          },
          include: {
            invoicePenagihanDetails: true,
            status: true,
            termOfPayment: true,
            purchaseOrder: {
              include: {
                customer: true,
                supplier: true,
              },
            },
          },
        });

        // Update InvoicePengiriman dengan link ke InvoicePenagihan
        await tx.invoicePengiriman.update({
          where: { id: invoicePengirimanId },
          data: {
            invoicePenagihanId: newInvoicePenagihan.id,
            updatedBy: userId,
          },
        });

        // Create AuditTrail untuk InvoicePenagihan (CREATE)
        await createAuditLog(
          'InvoicePenagihan',
          newInvoicePenagihan.id,
          'CREATE',
          userId,
          {
            action: 'Created from InvoicePengiriman',
            invoicePengirimanId: invoicePengirimanId,
            data: newInvoicePenagihan,
          }
        );

        // Create AuditTrail untuk InvoicePengiriman (UPDATE - linked to penagihan)
        await createAuditLog(
          'InvoicePengiriman',
          invoicePengirimanId,
          'UPDATE',
          userId,
          {
            action: 'Linked to InvoicePenagihan',
            invoicePenagihanId: newInvoicePenagihan.id,
            changes: {
              invoicePenagihanId: {
                before: null,
                after: newInvoicePenagihan.id,
              },
            },
          }
        );

        return newInvoicePenagihan;
      });

      return result;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating InvoicePenagihan from InvoicePengiriman:', error);
      throw new AppError('Failed to create InvoicePenagihan from InvoicePengiriman', 500);
    }
  }
}


