import { SuratJalan, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateSuratJalanInput,
  UpdateSuratJalanInput,
  SearchSuratJalanInput,
} from '@/schemas/surat-jalan.schema';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from './audit.service';
import { PaginatedResult } from '@/types/common.types';
import {
  calculatePagination,
  executePaginatedQuery,
} from '@/utils/pagination.utils';
import { getEntityWithAuditTrails } from '@/utils/audit.utils';

export class SuratJalanService {
  static async createSuratJalan(
    suratJalanData: CreateSuratJalanInput,
    userId: string
  ): Promise<SuratJalan> {
    try {
      const {
        suratJalanDetails,
        checklistSuratJalan,
        createdBy,
        updatedBy,
        ...suratJalanInfo
      } = suratJalanData;

      if (suratJalanInfo.invoiceId && suratJalanInfo.invoiceId !== null) {
        const invoice = await prisma.invoicePengiriman.findUnique({
          where: { id: suratJalanInfo.invoiceId },
        });

        if (!invoice) {
          throw new AppError('InvoicePengiriman not found', 404);
        }
      }

      if (suratJalanInfo.purchaseOrderId && suratJalanInfo.purchaseOrderId !== null) {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
          where: { id: suratJalanInfo.purchaseOrderId },
        });

        if (!purchaseOrder) {
          throw new AppError('PurchaseOrder not found', 404);
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
            create: suratJalanDetails.map((detail) => ({
              no_box: detail.no_box,
              total_quantity_in_box: detail.total_quantity_in_box,
              isi_box: detail.isi_box,
              sisa: detail.sisa,
              total_box: detail.total_box,
              suratJalanDetailItems: {
                create: detail.items.map((item) => ({
                  ...item,
                  createdBy: userId,
                  updatedBy: userId,
                })),
              },
            })),
          },
          checklistSuratJalan: checklistSuratJalan
            ? {
                create: {
                  ...checklistSuratJalan,
                  createdBy: userId,
                  updatedBy: userId,
                },
              }
            : undefined,
        },
        include: {
          suratJalanDetails: {
            include: {
              suratJalanDetailItems: true,
            },
          },
          invoice: true,
          purchaseOrder: true,
          status: true,
          historyPengiriman: {
            include: {
              status: true,
            },
          },
          checklistSuratJalan: true,
        },
      });

      await createAuditLog(
        'SuratJalan',
        newSuratJalan.id,
        'CREATE',
        userId,
        newSuratJalan
      );

      return newSuratJalan;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('no_surat_jalan')
      ) {
        throw new AppError('Surat jalan with this number already exists', 409);
      }
      if (error.code === 'P2003') {
        throw new AppError(
          'Foreign key constraint violation. Please check if the referenced invoice pengiriman or status exists.',
          400
        );
      }

      throw new AppError('Failed to create surat jalan', 500);
    }
  }

  static async getAllSuratJalan(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<SuratJalan>> {
    const { skip, take } = calculatePagination(page, limit);

    const dataQuery = prisma.suratJalan.findMany({
      skip,
      take,
      include: {
        suratJalanDetails: { include: { suratJalanDetailItems: true } },
        invoice: true,
        purchaseOrder: true,
        status: true,
        checklistSuratJalan: true,
      },
      orderBy: { id: 'desc' },
    });

    const countQuery = prisma.suratJalan.count();

    return executePaginatedQuery(dataQuery, countQuery, page, limit);
  }

  static async getSuratJalanById(id: string) {
    const findQuery = prisma.suratJalan.findUnique({
      where: { id },
      include: {
        suratJalanDetails: { include: { suratJalanDetailItems: true } },
        invoice: {
          include: {
            purchaseOrder: { include: { customer: true, supplier: true } },
          },
        },
        purchaseOrder: { include: { customer: true, supplier: true } },
        status: true,
        historyPengiriman: {
          include: { status: true },
          orderBy: { createdAt: 'desc' },
        },
        checklistSuratJalan: true,
      },
    });

    return getEntityWithAuditTrails(
      findQuery,
      'SuratJalan',
      id,
      'Surat Jalan not found'
    );
  }

  static async updateSuratJalan(
    id: string,
    data: UpdateSuratJalanInput['body'],
    userId: string
  ): Promise<SuratJalan> {
    const { suratJalanDetails, checklistSuratJalan, ...suratJalanInfo } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        const existingSuratJalan = await tx.suratJalan.findUnique({
          where: { id },
          include: {
            suratJalanDetails: true,
            checklistSuratJalan: true,
          },
        });
        if (!existingSuratJalan) {
          throw new AppError('Surat jalan not found', 404);
        }

        if (suratJalanDetails) {
          const detailIds =
            existingSuratJalan.suratJalanDetails?.map((d) => d.id) || [];
          if (detailIds.length > 0) {
            await tx.suratJalanDetailItem.deleteMany({
              where: { surat_jalan_detail_id: { in: detailIds } },
            });
            await tx.suratJalanDetail.deleteMany({
              where: { surat_jalan_id: id },
            });
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
                suratJalanDetailItems: {
                  create: detail.items.map((item) => ({
                    ...item,
                    createdBy: userId,
                    updatedBy: userId,
                  })),
                },
              },
            });
          }
        }

        // Handle checklist update
        if (checklistSuratJalan) {
          if (existingSuratJalan.checklistSuratJalan) {
            // Update existing checklist
            await tx.checklistSuratJalan.update({
              where: { suratJalanId: id },
              data: {
                ...checklistSuratJalan,
                updatedBy: userId,
              },
            });
          } else {
            // Create new checklist
            await tx.checklistSuratJalan.create({
              data: {
                suratJalanId: id,
                ...checklistSuratJalan,
                createdBy: userId,
                updatedBy: userId,
              },
            });
          }
        }

        const updatedSuratJalanData = await tx.suratJalan.update({
          where: { id },
          data: { ...suratJalanInfo, updatedBy: userId },
          include: {
            suratJalanDetails: { include: { suratJalanDetailItems: true } },
            invoice: true,
            purchaseOrder: true,
            status: true,
            checklistSuratJalan: true,
          },
        });

        await createAuditLog(
          'SuratJalan',
          updatedSuratJalanData.id,
          'UPDATE',
          userId,
          {
            before: existingSuratJalan,
            after: updatedSuratJalanData,
          }
        );

        return updatedSuratJalanData;
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('no_surat_jalan')
      ) {
        throw new AppError('Surat jalan with this number already exists', 409);
      }

      throw new AppError('Failed to update surat jalan', 500);
    }
  }

  static async processSuratJalan(ids: string[], userId: string): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        const suratJalanList = await tx.suratJalan.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            status: true,
            invoice: true,
            purchaseOrder: true,
            suratJalanDetails: {
              include: {
                suratJalanDetailItems: true,
              },
            },
            historyPengiriman: {
              include: {
                status: true,
              },
            },
            checklistSuratJalan: true,
          },
        });

        if (suratJalanList.length !== ids.length) {
          const foundIds = suratJalanList.map((suratJalan) => suratJalan.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          throw new AppError(
            `Surat jalan not found: ${missingIds.join(', ')}`,
            404
          );
        }

        const [draftStatus, readyToShipStatus] = await Promise.all([
          tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'DRAFT SURAT JALAN',
                category: 'Surat Jalan',
              },
            },
          }),
          tx.status.findUnique({
            where: {
              status_code_category: {
                status_code: 'READY TO SHIP SURAT JALAN',
                category: 'Surat Jalan',
              },
            },
          }),
        ]);

        if (!draftStatus || !readyToShipStatus) {
          throw new AppError('Required statuses not found', 404);
        }

        const invalidSuratJalan = suratJalanList.filter(
          (suratJalan) => suratJalan.statusId !== draftStatus.id
        );

        if (invalidSuratJalan.length > 0) {
          const invalidIds = invalidSuratJalan.map(
            (suratJalan) => suratJalan.id
          );
          throw new AppError(
            `Surat jalan dengan ID ${invalidIds.join(
              ', '
            )} tidak memiliki status DRAFT SURAT JALAN`,
            400
          );
        }

        const suratJalanWithoutChecklist = suratJalanList.filter(
          (suratJalan) => !suratJalan.checklistSuratJalan
        );

        if (suratJalanWithoutChecklist.length > 0) {
          const missingChecklistIds = suratJalanWithoutChecklist.map(
            (suratJalan) => suratJalan.no_surat_jalan
          );
          throw new AppError(
            `Surat jalan dengan no surat jalan ${missingChecklistIds.join(
              ', '
            )} belum melengkapi checklist`,
            400
          );
        }

        const updatedSuratJalan = await tx.suratJalan.updateMany({
          where: {
            id: { in: ids },
          },
          data: {
            statusId: readyToShipStatus.id,
            updatedBy: userId,
          },
        });

        const resultSuratJalan = await tx.suratJalan.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            status: true,
            invoice: true,
            purchaseOrder: true,
            suratJalanDetails: {
              include: {
                suratJalanDetailItems: true,
              },
            },
            historyPengiriman: {
              include: {
                status: true,
              },
            },
            checklistSuratJalan: true,
          },
        });

        for (const suratJalan of resultSuratJalan) {
          await createAuditLog('SuratJalan', suratJalan.id, 'UPDATE', userId, {
            action: 'PROCESS_SURAT_JALAN',
            before: { statusId: draftStatus.id },
            after: { statusId: readyToShipStatus.id },
          });
        }

        return {
          message: 'Surat jalan berhasil diproses',
          processedCount: updatedSuratJalan.count,
          suratJalan: resultSuratJalan,
        };
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      throw new AppError('Failed to process surat jalan', 500);
    }
  }

  static async deleteSuratJalan(
    id: string,
    userId: string
  ): Promise<SuratJalan> {
    const suratJalan = await prisma.suratJalan.findUnique({ where: { id } });
    if (!suratJalan) {
      throw new AppError('Surat Jalan not found', 404);
    }

    await createAuditLog('SuratJalan', id, 'DELETE', userId, suratJalan);

    await prisma.$transaction(async (tx) => {
      const detailIds = (
        await tx.suratJalanDetail.findMany({
          where: { surat_jalan_id: id },
          select: { id: true },
        })
      ).map((d) => d.id);
      if (detailIds.length > 0) {
        await tx.suratJalanDetailItem.deleteMany({
          where: { surat_jalan_detail_id: { in: detailIds } },
        });
      }
      await tx.suratJalanDetail.deleteMany({ where: { surat_jalan_id: id } });
      await tx.historyPengiriman.deleteMany({ where: { surat_jalan_id: id } });
      await tx.suratJalan.delete({ where: { id } });
    });

    return suratJalan;
  }

  static async searchSuratJalan(
    query: SearchSuratJalanInput['query']
  ): Promise<PaginatedResult<SuratJalan>> {
    const {
      no_surat_jalan,
      deliver_to,
      PIC,
      invoiceId,
      purchaseOrderId,
      status_code,
      is_printed,
      page = 1,
      limit = 10,
    } = query;
    const { skip, take } = calculatePagination(page, limit);
    const filters: Prisma.SuratJalanWhereInput[] = [];

    if (no_surat_jalan)
      filters.push({
        no_surat_jalan: { contains: no_surat_jalan, mode: 'insensitive' },
      });
    if (deliver_to)
      filters.push({
        deliver_to: { contains: deliver_to, mode: 'insensitive' },
      });
    if (PIC) filters.push({ PIC: { contains: PIC, mode: 'insensitive' } });
    if (invoiceId) filters.push({ invoiceId });
    if (purchaseOrderId) filters.push({ purchaseOrderId });
    if (status_code) filters.push({ status: { status_code: status_code } });
    if (is_printed !== undefined) filters.push({ is_printed });

    const whereClause = filters.length > 0 ? { AND: filters } : {};

    const dataQuery = prisma.suratJalan.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        suratJalanDetails: { include: { suratJalanDetailItems: true } },
        invoice: {
          include: { purchaseOrder: { include: { customer: true } } },
        },
        purchaseOrder: { include: { customer: true } },
        status: true,
        checklistSuratJalan: true,
      },
      orderBy: { id: 'desc' },
    });

    const countQuery = prisma.suratJalan.count({ where: whereClause });

    return executePaginatedQuery(dataQuery, countQuery, page, limit);
  }

  static async recordPrint(
    id: string,
    userId: string
  ): Promise<SuratJalan> {
    try {
      const suratJalan = await prisma.suratJalan.findUnique({
        where: { id },
      });

      if (!suratJalan) {
        throw new AppError('Surat Jalan not found', 404);
      }

      const updatedSuratJalan = await prisma.suratJalan.update({
        where: { id },
        data: {
          is_printed: true,
          print_counter: { increment: 1 },
          updatedBy: userId,
        },
        include: {
          suratJalanDetails: { include: { suratJalanDetailItems: true } },
          invoice: true,
          purchaseOrder: true,
          status: true,
          checklistSuratJalan: true,
        },
      });

      await createAuditLog(
        'SuratJalan',
        id,
        'UPDATE',
        userId,
        {
          action: 'RECORD_PRINT',
          before: {
            is_printed: suratJalan.is_printed,
            print_counter: suratJalan.print_counter,
          },
          after: {
            is_printed: updatedSuratJalan.is_printed,
            print_counter: updatedSuratJalan.print_counter,
          },
        }
      );

      return updatedSuratJalan;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to record print for surat jalan', 500);
    }
  }
}
