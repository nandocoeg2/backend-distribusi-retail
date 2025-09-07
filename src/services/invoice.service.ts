import { Invoice, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  SearchInvoiceInput,
} from '@/schemas/invoice.schema';
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

export class InvoiceService {
  static async createInvoice(invoiceData: CreateInvoiceInput): Promise<Invoice> {
    try {
      const { invoiceDetails, ...invoiceInfo } = invoiceData;
      
      // Set default values
      const dataForDb = {
        ...invoiceInfo,
        tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : new Date(),
        expired_date: invoiceInfo.expired_date ? new Date(invoiceInfo.expired_date) : null,
        createdBy: 'system', // Should be replaced with actual user ID from auth
        updatedBy: 'system', // Should be replaced with actual user ID from auth
        invoiceDetails: invoiceDetails ? {
          create: invoiceDetails.map(detail => ({
            ...detail,
            createdBy: 'system',
            updatedBy: 'system',
          }))
        } : undefined,
      };

      return await prisma.invoice.create({
        data: dataForDb,
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('no_invoice')) {
        throw new AppError('Invoice with this number already exists', 409);
      }
      throw error;
    }
  }

  static async getAllInvoices(page: number = 1, limit: number = 10): Promise<PaginatedResult<Invoice>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: parseInt(limit.toString()),
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoice.count(),
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

  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
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
      },
    });

    return invoice;
  }

  static async updateInvoice(
    id: string,
    data: UpdateInvoiceInput['body']
  ): Promise<Invoice | null> {
    const { invoiceDetails, ...invoiceInfo } = data;

    try {
      const updatedInvoice = await prisma.$transaction(async (tx) => {
        // Check if the invoice exists
        const existingInvoice = await tx.invoice.findUnique({
          where: { id },
        });

        if (!existingInvoice) {
          throw new AppError('Invoice not found', 404);
        }

        // If invoiceDetails are provided, handle them
        if (invoiceDetails) {
          // Delete existing details
          await tx.invoiceDetail.deleteMany({
            where: { invoiceId: id },
          });

          // Create new details
          await tx.invoiceDetail.createMany({
            data: invoiceDetails.map((detail) => ({
              ...detail,
              invoiceId: id,
              createdBy: 'system',
              updatedBy: 'system',
            })),
          });
        }

        // Update the invoice itself
        const invoice = await tx.invoice.update({
          where: { id },
          data: {
            ...invoiceInfo,
            tanggal: invoiceInfo.tanggal ? new Date(invoiceInfo.tanggal) : undefined,
            expired_date: invoiceInfo.expired_date ? new Date(invoiceInfo.expired_date) : null,
            updatedBy: 'system', // Should be replaced with actual user ID from auth
          },
          include: {
            invoiceDetails: true,
            statusPembayaran: true,
            purchaseOrder: true,
          },
        });

        return invoice;
      });

      return updatedInvoice;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating invoice:', error);
      throw new AppError('Failed to update invoice', 500);
    }
  }

  static async deleteInvoice(id: string): Promise<Invoice | null> {
    try {
      return await prisma.invoice.delete({
        where: { id },
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async searchInvoices(query: SearchInvoiceInput['query']): Promise<PaginatedResult<Invoice>> {
    const { 
      no_invoice, 
      deliver_to, 
      type, 
      statusPembayaranId,
      purchaseOrderId,
      tanggal_start,
      tanggal_end,
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    const filters: Prisma.InvoiceWhereInput[] = [];
    
    if (no_invoice) {
      filters.push({ no_invoice: { contains: no_invoice, mode: 'insensitive' } });
    }
    if (deliver_to) {
      filters.push({ deliver_to: { contains: deliver_to, mode: 'insensitive' } });
    }
    if (type) {
      filters.push({ type: type as 'PEMBAYARAN' | 'PENGIRIMAN' });
    }
    if (statusPembayaranId) {
      filters.push({ statusPembayaranId });
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
      prisma.invoice.findMany({
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoice.count({
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
