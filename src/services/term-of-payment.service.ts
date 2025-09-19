import { TermOfPayment, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateTermOfPaymentInput, UpdateTermOfPaymentInput } from '@/schemas/term-of-payment.schema';
import { AppError } from '../utils/app-error';
import { PaginatedResult } from '@/types/common.types';
import { createAuditLog } from './audit.service';

export class TermOfPaymentService {
  static async createTermOfPayment(data: CreateTermOfPaymentInput, userId: string): Promise<TermOfPayment> {
    try {
      const { createdBy, updatedBy, ...termOfPaymentData } = data;
      
      const termOfPayment = await prisma.termOfPayment.create({
        data: {
          ...termOfPaymentData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('TermOfPayment', termOfPayment.id, 'CREATE', userId, termOfPayment);
      
      return termOfPayment;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('kode_top')) {
        throw new AppError('Term of Payment with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllTermOfPayments(page: number = 1, limit: number = 10): Promise<PaginatedResult<TermOfPayment>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.termOfPayment.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.termOfPayment.count(),
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

  static async getTermOfPaymentById(id: string) {
    const termOfPayment = await prisma.termOfPayment.findUnique({
      where: { id },
    });

    if (!termOfPayment) {
      throw new AppError('Term of Payment not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'TermOfPayment',
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
      ...termOfPayment,
      auditTrails,
    };
  }

  static async updateTermOfPayment(id: string, data: UpdateTermOfPaymentInput['body'], userId: string): Promise<TermOfPayment> {
    const existingTermOfPayment = await prisma.termOfPayment.findUnique({
      where: { id },
    });

    if (!existingTermOfPayment) {
      throw new AppError('Term of Payment not found', 404);
    }

    const { updatedBy, ...termOfPaymentData } = data;

    const updatedTermOfPayment = await prisma.termOfPayment.update({
      where: { id },
      data: {
        ...termOfPaymentData,
        updatedBy: userId,
      },
    });

    await createAuditLog('TermOfPayment', updatedTermOfPayment.id, 'UPDATE', userId, {
      before: existingTermOfPayment,
      after: updatedTermOfPayment,
    });

    return updatedTermOfPayment;
  }

  static async deleteTermOfPayment(id: string, userId: string): Promise<TermOfPayment> {
    const existingTermOfPayment = await prisma.termOfPayment.findUnique({
      where: { id },
    });

    if (!existingTermOfPayment) {
      throw new AppError('Term of Payment not found', 404);
    }

    await createAuditLog('TermOfPayment', id, 'DELETE', userId, existingTermOfPayment);

    return await prisma.termOfPayment.delete({
      where: { id },
    });
  }

  static async searchTermOfPayments(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<TermOfPayment>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllTermOfPayments(page, limit);
    }

    const filters: Prisma.TermOfPaymentWhereInput[] = [
      {
        kode_top: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        batas_hari: {
          equals: isNaN(parseInt(query)) ? undefined : parseInt(query),
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.termOfPayment.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.termOfPayment.count({
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
