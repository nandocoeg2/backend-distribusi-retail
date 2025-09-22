import { LaporanPenerimaanBarang, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput,
} from '@/schemas/laporan-penerimaan-barang.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';
import { AppError } from '@/utils/app-error';

export class LaporanPenerimaanBarangService extends BaseService<
  LaporanPenerimaanBarang,
  CreateLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput['body']
> {
  protected modelName = 'LaporanPenerimaanBarang';
  protected tableName = 'LaporanPenerimaanBarang';
  protected prismaModel = prisma.laporanPenerimaanBarang;

  private static includeRelations = {
    purchaseOrder: true,
    customer: true,
    termOfPayment: true,
    status: true,
    files: true,
  } satisfies Prisma.LaporanPenerimaanBarangInclude;

  static async createLaporanPenerimaanBarang(
    data: CreateLaporanPenerimaanBarangInput,
    userId: string
  ): Promise<LaporanPenerimaanBarang> {
    const service = new LaporanPenerimaanBarangService();

    await service.validateRelations(data);

    const preprocessData = (
      payload: CreateLaporanPenerimaanBarangInput,
      actorId: string
    ) => {
      const { tanggal_po, files, ...rest } = payload;
      return {
        ...rest,
        tanggal_po: tanggal_po ? new Date(tanggal_po) : undefined,
        files: files && files.length > 0 ? { connect: files.map((id) => ({ id })) } : undefined,
        createdBy: actorId,
        updatedBy: actorId,
      };
    };

    return service.createEntity(data, userId, preprocessData);
  }

  static async getAllLaporanPenerimaanBarang(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<LaporanPenerimaanBarang>> {
    const service = new LaporanPenerimaanBarangService();
    return service.getAllEntities(page, limit, this.includeRelations);
  }

  static async getLaporanPenerimaanBarangById(id: string) {
    const service = new LaporanPenerimaanBarangService();
    return service.getEntityById(id, this.includeRelations);
  }

  static async updateLaporanPenerimaanBarang(
    id: string,
    data: UpdateLaporanPenerimaanBarangInput['body'],
    userId: string
  ): Promise<LaporanPenerimaanBarang> {
    const service = new LaporanPenerimaanBarangService();

    await service.validateRelations(data, id);

    const preprocessData = (
      payload: UpdateLaporanPenerimaanBarangInput['body'],
      actorId: string
    ) => {
      const { tanggal_po, files, ...rest } = payload;
      return {
        ...rest,
        tanggal_po: tanggal_po ? new Date(tanggal_po) : undefined,
        files:
          files !== undefined
            ? { set: files.map((id) => ({ id })) }
            : undefined,
        updatedBy: actorId,
      };
    };

    return service.updateEntity(id, data, userId, preprocessData);
  }

  static async deleteLaporanPenerimaanBarang(
    id: string,
    userId: string
  ): Promise<LaporanPenerimaanBarang> {
    const service = new LaporanPenerimaanBarangService();
    return service.deleteEntity(id, userId);
  }

  static async searchLaporanPenerimaanBarang(
    query: string | undefined,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<LaporanPenerimaanBarang>> {
    const service = new LaporanPenerimaanBarangService();

    if (!query) {
      return service.getAllEntities(page, limit, this.includeRelations);
    }

    const filters: Prisma.LaporanPenerimaanBarangWhereInput[] = [
      {
        alamat_customer: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        files: {
          some: {
            filename: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      },
      {
        purchaseOrder: {
          po_number: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
      {
        customer: {
          namaCustomer: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
      {
        termOfPayment: {
          kode_top: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
      {
        status: {
          status_name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
    ];

    return service.searchEntities(
      filters,
      page,
      limit,
      this.includeRelations
    );
  }

  private async validateRelations(
    data:
      | CreateLaporanPenerimaanBarangInput
      | UpdateLaporanPenerimaanBarangInput['body'],
    entityId?: string
  ) {
    const { purchaseOrderId, customerId, termin_bayar, statusId, files } = data;

    if (purchaseOrderId) {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
      });
      if (!purchaseOrder) {
        throw new AppError('Purchase Order not found', 404);
      }
    } else if (!entityId) {
      throw new AppError('Purchase Order ID is required', 400);
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
    } else if (!entityId) {
      throw new AppError('Customer ID is required', 400);
    }

    if (termin_bayar) {
      const termOfPayment = await prisma.termOfPayment.findUnique({
        where: { id: termin_bayar },
      });
      if (!termOfPayment) {
        throw new AppError('Term of Payment not found', 404);
      }
    }

    if (statusId) {
      const status = await prisma.status.findUnique({
        where: { id: statusId },
      });
      if (!status) {
        throw new AppError('Status not found', 404);
      }
    }

    if (files && files.length > 0) {
      const uploadedFiles = await prisma.fileUploaded.findMany({
        where: {
          id: { in: files },
        },
        select: {
          id: true,
          laporanPenerimaanBarangId: true,
        },
      });

      if (uploadedFiles.length !== files.length) {
        throw new AppError('One or more files not found', 404);
      }

      const conflictingFile = uploadedFiles.find((file) => {
        if (!file.laporanPenerimaanBarangId) {
          return false;
        }

        if (!entityId) {
          return true;
        }

        return file.laporanPenerimaanBarangId !== entityId;
      });

      if (conflictingFile) {
        throw new AppError('One or more files are already linked to another report', 400);
      }
    }
  }
}
