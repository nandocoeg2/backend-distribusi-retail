import { SuratJalan, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateSuratJalanInput,
  UpdateSuratJalanInput,
  SearchSuratJalanInput,
} from '@/schemas/surat-jalan.schema';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from './audit.service';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class SuratJalanService {
  static async createSuratJalan(suratJalanData: CreateSuratJalanInput, userId: string): Promise<SuratJalan> {
    try {
      const { suratJalanDetails, createdBy, updatedBy, ...suratJalanInfo } = suratJalanData;

      if (suratJalanInfo.invoiceId && suratJalanInfo.invoiceId !== null) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: suratJalanInfo.invoiceId },
        });

        if (!invoice) {
          throw new AppError('Invoice not found', 404);
        }
      }

      if (suratJalanInfo.statusId && suratJalanInfo.statusId !== null) {
        const status = await prisma.status.findUnique({
          where: { id: suratJalanInfo.statusId },
        });

        if (!status) {
          throw new AppError('Status not found', 404);
        }
      }

      const newSuratJalan = await prisma.suratJalan.create({
        data: {
          ...suratJalanInfo,
          createdBy: userId,
          updatedBy: userId,
          suratJalanDetails: {
            create: suratJalanDetails.map(detail => ({
              no_box: detail.no_box,
              total_quantity_in_box: detail.total_quantity_in_box,
              isi_box: detail.isi_box,
              sisa: detail.sisa,
              total_box: detail.total_box,
              suratJalanDetailItems: {
                create: detail.items.map(item => ({
                  ...item,
                  createdBy: userId,
                  updatedBy: userId,
                }))
              }
            }))
          }
        },
        include: {
          suratJalanDetails: {
            include: {
              suratJalanDetailItems: true
            }
          },
          invoice: true,
          status: true,
          historyPengiriman: {
            include: {
              status: true
            }
          }
        }
      });

      await createAuditLog('SuratJalan', newSuratJalan.id, 'CREATE', userId, newSuratJalan);

      return newSuratJalan;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      
      if (error.code === 'P2002' && error.meta?.target?.includes('no_surat_jalan')) {
        throw new AppError('Surat jalan with this number already exists', 409);
      }
      if (error.code === 'P2003') {
        throw new AppError('Foreign key constraint violation. Please check if the referenced invoice or status exists.', 400);
      }
      
      throw new AppError('Failed to create surat jalan', 500);
    }
  }

  static async getAllSuratJalan(page: number = 1, limit: number = 10): Promise<PaginatedResult<SuratJalan>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      prisma.suratJalan.findMany({
        skip,
        take: parseInt(limit.toString()),
        include: {
          suratJalanDetails: { include: { suratJalanDetailItems: true } },
          invoice: true,
          status: true,
        },
        orderBy: { id: 'desc' }
      }),
      prisma.suratJalan.count(),
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

  static async getSuratJalanById(id: string) {
    const suratJalan = await prisma.suratJalan.findUnique({
      where: { id },
      include: {
        suratJalanDetails: { include: { suratJalanDetailItems: true } },
        invoice: { include: { purchaseOrder: { include: { customer: true, supplier: true } } } },
        status: true,
        historyPengiriman: { include: { status: true }, orderBy: { createdAt: 'desc' } }
      },
    });

    if (!suratJalan) {
      throw new AppError('Surat Jalan not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: { tableName: 'SuratJalan', recordId: id },
      include: { user: { select: { id: true, username: true, firstName: true, lastName: true } } },
      orderBy: { timestamp: 'desc' },
    });

    return { ...suratJalan, auditTrails };
  }

  static async updateSuratJalan(id: string, data: UpdateSuratJalanInput['body'], userId: string): Promise<SuratJalan> {
    const { suratJalanDetails, ...suratJalanInfo } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        const existingSuratJalan = await tx.suratJalan.findUnique({
          where: { id },
          include: {
            suratJalanDetails: true,
          },
        });
        if (!existingSuratJalan) {
          throw new AppError('Surat jalan not found', 404);
        }

        if (suratJalanDetails) {
          const detailIds = existingSuratJalan.suratJalanDetails?.map(d => d.id) || [];
          if (detailIds.length > 0) {
            await tx.suratJalanDetailItem.deleteMany({ where: { surat_jalan_detail_id: { in: detailIds } } });
            await tx.suratJalanDetail.deleteMany({ where: { surat_jalan_id: id } });
          }

          for (const detail of suratJalanDetails) {
            await tx.suratJalanDetail.create({
              data: {
                surat_jalan_id: id,
                no_box: detail.no_box,
                total_quantity_in_box: detail.total_quantity_in_box,
                isi_box: detail.isi_box,
                sisa: detail.sisa,
                total_box: detail.total_box,
                suratJalanDetailItems: { create: detail.items.map(item => ({ ...item, createdBy: userId, updatedBy: userId })) }
              }
            });
          }
        }

        const updatedSuratJalanData = await tx.suratJalan.update({
          where: { id },
          data: { ...suratJalanInfo, updatedBy: userId },
          include: {
            suratJalanDetails: { include: { suratJalanDetailItems: true } },
            invoice: true,
            status: true,
          },
        });

        await createAuditLog('SuratJalan', updatedSuratJalanData.id, 'UPDATE', userId, {
          before: existingSuratJalan,
          after: updatedSuratJalanData,
        });

        return updatedSuratJalanData;
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (error.code === 'P2002' && error.meta?.target?.includes('no_surat_jalan')) {
        throw new AppError('Surat jalan with this number already exists', 409);
      }

      throw new AppError('Failed to update surat jalan', 500);
    }
  }

  static async deleteSuratJalan(id: string, userId: string): Promise<SuratJalan> {
    const suratJalan = await prisma.suratJalan.findUnique({ where: { id } });
    if (!suratJalan) {
      throw new AppError('Surat Jalan not found', 404);
    }

    await createAuditLog('SuratJalan', id, 'DELETE', userId, suratJalan);

    await prisma.$transaction(async (tx) => {
      const detailIds = (await tx.suratJalanDetail.findMany({ where: { surat_jalan_id: id }, select: { id: true } })).map(d => d.id);
      if (detailIds.length > 0) {
        await tx.suratJalanDetailItem.deleteMany({ where: { surat_jalan_detail_id: { in: detailIds } } });
      }
      await tx.suratJalanDetail.deleteMany({ where: { surat_jalan_id: id } });
      await tx.historyPengiriman.deleteMany({ where: { surat_jalan_id: id } });
      await tx.suratJalan.delete({ where: { id } });
    });

    return suratJalan;
  }

  static async searchSuratJalan(query: SearchSuratJalanInput['query']): Promise<PaginatedResult<SuratJalan>> {
    const { no_surat_jalan, deliver_to, PIC, invoiceId, statusId, is_printed, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const filters: Prisma.SuratJalanWhereInput[] = [];
    
    if (no_surat_jalan) filters.push({ no_surat_jalan: { contains: no_surat_jalan, mode: 'insensitive' } });
    if (deliver_to) filters.push({ deliver_to: { contains: deliver_to, mode: 'insensitive' } });
    if (PIC) filters.push({ PIC: { contains: PIC, mode: 'insensitive' } });
    if (invoiceId) filters.push({ invoiceId });
    if (statusId) filters.push({ statusId });
    if (is_printed !== undefined) filters.push({ is_printed });

    const [data, totalItems] = await Promise.all([
      prisma.suratJalan.findMany({
        where: { AND: filters.length > 0 ? filters : undefined },
        skip,
        take: parseInt(limit.toString()),
        include: {
          suratJalanDetails: { include: { suratJalanDetailItems: true } },
          invoice: { include: { purchaseOrder: { include: { customer: true } } } },
          status: true,
        },
        orderBy: { id: 'desc' }
      }),
      prisma.suratJalan.count({ where: { AND: filters.length > 0 ? filters : undefined } }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return { data, pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit } };
  }
}
