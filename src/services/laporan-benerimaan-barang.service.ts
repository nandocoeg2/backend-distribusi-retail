import { LaporanBenerimaanBarang, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateLaporanBenerimaanBarangInput,
  UpdateLaporanBenerimaanBarangInput,
} from '@/schemas/laporan-benerimaan-barang.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';
import { AppError } from '@/utils/app-error';

export class LaporanBenerimaanBarangService extends BaseService<
  LaporanBenerimaanBarang,
  CreateLaporanBenerimaanBarangInput,
  UpdateLaporanBenerimaanBarangInput['body']
> {
  protected modelName = 'LaporanBenerimaanBarang';
  protected tableName = 'LaporanBenerimaanBarang';
  protected prismaModel = prisma.laporanBenerimaanBarang;

  private static includeRelations = {
    purchaseOrder: true,
    customer: true,
    termOfPayment: true,
  } satisfies Prisma.LaporanBenerimaanBarangInclude;

  static async createLaporanBenerimaanBarang(
    data: CreateLaporanBenerimaanBarangInput,
    userId: string
  ): Promise<LaporanBenerimaanBarang> {
    const service = new LaporanBenerimaanBarangService();

    await service.validateRelations(data);

    const preprocessData = (
      payload: CreateLaporanBenerimaanBarangInput,
      actorId: string
    ) => {
      const { tanggal_po, ...rest } = payload;
      return {
        ...rest,
        tanggal_po: tanggal_po ? new Date(tanggal_po) : undefined,
        createdBy: actorId,
        updatedBy: actorId,
      };
    };

    return service.createEntity(data, userId, preprocessData);
  }

  static async getAllLaporanBenerimaanBarang(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<LaporanBenerimaanBarang>> {
    const service = new LaporanBenerimaanBarangService();
    return service.getAllEntities(page, limit, this.includeRelations);
  }

  static async getLaporanBenerimaanBarangById(id: string) {
    const service = new LaporanBenerimaanBarangService();
    return service.getEntityById(id, this.includeRelations);
  }

  static async updateLaporanBenerimaanBarang(
    id: string,
    data: UpdateLaporanBenerimaanBarangInput['body'],
    userId: string
  ): Promise<LaporanBenerimaanBarang> {
    const service = new LaporanBenerimaanBarangService();

    await service.validateRelations(data, id);

    const preprocessData = (
      payload: UpdateLaporanBenerimaanBarangInput['body'],
      actorId: string
    ) => {
      const { tanggal_po, ...rest } = payload;
      return {
        ...rest,
        tanggal_po: tanggal_po ? new Date(tanggal_po) : undefined,
        updatedBy: actorId,
      };
    };

    return service.updateEntity(id, data, userId, preprocessData);
  }

  static async deleteLaporanBenerimaanBarang(
    id: string,
    userId: string
  ): Promise<LaporanBenerimaanBarang> {
    const service = new LaporanBenerimaanBarangService();
    return service.deleteEntity(id, userId);
  }

  static async searchLaporanBenerimaanBarang(
    query: string | undefined,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<LaporanBenerimaanBarang>> {
    const service = new LaporanBenerimaanBarangService();

    if (!query) {
      return service.getAllEntities(page, limit, this.includeRelations);
    }

    const filters: Prisma.LaporanBenerimaanBarangWhereInput[] = [
      {
        alamat_customer: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        file_path: {
          contains: query,
          mode: 'insensitive',
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
      | CreateLaporanBenerimaanBarangInput
      | UpdateLaporanBenerimaanBarangInput['body'],
    entityId?: string
  ) {
    const { purchaseOrderId, customerId, termin_bayar } = data;

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
  }
}
