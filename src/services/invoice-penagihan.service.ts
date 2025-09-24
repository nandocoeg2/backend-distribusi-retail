import { InvoicePenagihan, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateInvoicePenagihanInput,
  UpdateInvoicePenagihanInput,
  SearchInvoicePenagihanInput,
} from '@/schemas/invoice-penagihan.schema';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from './audit.service';
import { PaginatedResult } from '@/types/common.types';
import { generateUniqueDocumentNumber, DOCUMENT_CONFIGS } from '@/utils/random.utils';

export class InvoicePenagihanService {
  static async createInvoice(
    invoiceData: CreateInvoicePenagihanInput,
    userId: string
  ): Promise<InvoicePenagihan> {
    try {
      const { invoicePenagihanDetails, ...invoiceInfo } = invoiceData;

      // Generate unique invoice number
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
        invoiceInfo.purchaseOrderId
      );

      const newInvoice = await prisma.invoicePenagihan.create({
        data: {
          ...invoiceInfo,
          no_invoice_penagihan: invoiceNumber,
          tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : new Date(),
          createdBy: userId,
          updatedBy: userId,
          invoicePenagihanDetails: invoicePenagihanDetails
            ? {
                create: invoicePenagihanDetails.map((detail) => ({
                  ...detail,
                  createdBy: userId,
                  updatedBy: userId,
                })),
              }
            : undefined,
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

      await createAuditLog('InvoicePenagihan', newInvoice.id, 'CREATE', userId, newInvoice);

      return newInvoice;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('no_invoice_penagihan')) {
        throw new AppError('InvoicePenagihan with this number already exists', 409);
      }
      throw error;
    }
  }

  static async getAllInvoices(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<InvoicePenagihan>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.invoicePenagihan.findMany({
        skip,
        take: parseInt(limit.toString()),
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoicePenagihan.count(),
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

  static async getInvoiceById(id: string): Promise<InvoicePenagihan | null> {
    const invoice = await prisma.invoicePenagihan.findUnique({
      where: { id },
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

    if (!invoice) {
      throw new AppError('InvoicePenagihan not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'InvoicePenagihan',
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
    data: UpdateInvoicePenagihanInput['body'],
    userId: string
  ): Promise<InvoicePenagihan | null> {
    const { invoicePenagihanDetails, ...invoiceInfo } = data;

    try {
      const updatedInvoice = await prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoicePenagihan.findUnique({
          where: { id },
        });

        if (!existingInvoice) {
          throw new AppError('InvoicePenagihan not found', 404);
        }

        if (invoicePenagihanDetails) {
          await tx.invoicePenagihanDetail.deleteMany({
            where: { invoicePenagihanId: id },
          });

          await tx.invoicePenagihanDetail.createMany({
            data: invoicePenagihanDetails.map((detail) => ({
              ...detail,
              invoicePenagihanId: id,
              createdBy: userId,
              updatedBy: userId,
            })),
          });
        }

        const invoice = await tx.invoicePenagihan.update({
          where: { id },
          data: {
            ...invoiceInfo,
            tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : undefined,
            updatedBy: userId,
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

        await createAuditLog('InvoicePenagihan', invoice.id, 'UPDATE', userId, {
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
      console.error('Error updating InvoicePenagihan:', error);
      throw new AppError('Failed to update InvoicePenagihan', 500);
    }
  }

  static async deleteInvoice(id: string, userId: string): Promise<InvoicePenagihan | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoicePenagihan.findUnique({
          where: { id },
        });

        if (!existingInvoice) {
          throw new AppError('InvoicePenagihan not found', 404);
        }

        await createAuditLog('InvoicePenagihan', id, 'DELETE', userId, existingInvoice);

        await tx.invoicePenagihanDetail.deleteMany({
          where: { invoicePenagihanId: id },
        });

        return await tx.invoicePenagihan.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error deleting InvoicePenagihan:', error);
      throw new AppError('Failed to delete InvoicePenagihan', 500);
    }
  }

  static async searchInvoices(
    query: SearchInvoicePenagihanInput['query']
  ): Promise<PaginatedResult<InvoicePenagihan>> {
    const {
      no_invoice_penagihan,
      kepada,
      statusId,
      purchaseOrderId,
      termOfPaymentId,
      kw,
      fp,
      tanggal_start,
      tanggal_end,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const filters: Prisma.InvoicePenagihanWhereInput[] = [];

    if (no_invoice_penagihan) {
      filters.push({ no_invoice_penagihan: { contains: no_invoice_penagihan, mode: 'insensitive' } });
    }
    if (kepada) {
      filters.push({ kepada: { contains: kepada, mode: 'insensitive' } });
    }
    if (statusId) {
      filters.push({ statusId });
    }
    if (purchaseOrderId) {
      filters.push({ purchaseOrderId });
    }
    if (termOfPaymentId) {
      filters.push({ termOfPaymentId });
    }
    if (kw !== undefined) {
      filters.push({ kw });
    }
    if (fp !== undefined) {
      filters.push({ fp });
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
      prisma.invoicePenagihan.findMany({
        where: {
          AND: filters.length > 0 ? filters : undefined,
        },
        skip,
        take: parseInt(limit.toString()),
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoicePenagihan.count({
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
