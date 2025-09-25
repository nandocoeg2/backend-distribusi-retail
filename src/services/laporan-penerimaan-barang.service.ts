import { ActionType, LaporanPenerimaanBarang, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreateLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput,
} from '@/schemas/laporan-penerimaan-barang.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';
import { AppError } from '@/utils/app-error';
import { ConversionService } from './conversion.service';
import logger from '@/config/logger';
import { generateFilenameWithPrefix } from '@/utils/random.utils';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createAuditLog } from './audit.service';

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
          alamatPengiriman: {
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

  static async uploadFileAndConvert(
    file: Buffer,
    mimeType: string,
    originalFilename: string,
    prompt?: string,
    userId?: string
  ): Promise<{
    lpbData?: any;
  }> {
    const pump = promisify(pipeline);
    let tempFilepath: string | null = null;

    try {
      // Buat direktori upload seperti bulk purchase order
      const today = new Date().toISOString().split('T')[0]!;
      const uploadDir = path.join(process.cwd(), 'fileuploaded', 'laporan-penerimaan-barang', today);
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // Generate filename dengan prefix seperti bulk purchase order
      const filename = generateFilenameWithPrefix('LPB', originalFilename);
      const filepath = path.join(uploadDir, filename);
      tempFilepath = filepath;

      // Simpan file ke filesystem
      await fs.promises.writeFile(filepath, file);

      // Get file stats
      const stats = await fs.promises.stat(filepath);

      // Buat file uploaded record dengan path yang benar
      const fileUploaded = await prisma.fileUploaded.create({
        data: {
          filename: originalFilename, // Original filename
          path: filepath, // Full path ke file
          mimetype: mimeType,
          size: stats.size,
          createdBy: userId,
        },
      });
      await createAuditLog('FileUploaded', fileUploaded.id, ActionType.CREATE, userId || 'system', {
        filename: originalFilename,
        path: filepath,
        mimetype: mimeType,
        size: stats.size,
      });

      // Default prompt jika tidak ada
      const defaultPrompt = prompt || 
        'Convert this document into structured JSON format for goods receipt report. ' +
        'Extract relevant information such as FPP number, order date, delivery details, supplier information, items, pricing, and payment information.';

      try {
        // Konversi file menggunakan ConversionService dengan schema laporan penerimaan barang
        const convertedData = await ConversionService.convertFileToJson(
          file,
          mimeType,
          defaultPrompt,
          'laporan-penerimaan-barang'
        );

        // Buat data LPB dari converted data
        let lpbData: any = null;
        try {
          lpbData = await this.createLpbFromConvertedData(convertedData, userId);
          
          // Hubungkan file dengan LPB yang baru dibuat
          if (lpbData && lpbData.laporanPenerimaanBarangId) {
            await prisma.fileUploaded.update({
              where: { id: fileUploaded.id },
              data: {
                laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
              },
            });
            await createAuditLog('FileUploaded', fileUploaded.id, ActionType.UPDATE, userId || 'system', {
              laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
            });
            
            logger.info('File connected to LPB', {
              fileId: fileUploaded.id,
              lpbId: lpbData.laporanPenerimaanBarangId,
            });
          }
        } catch (lpbError) {
          logger.warn('Failed to create LPB data from converted data', { error: lpbError });
          // Tidak throw error, karena file upload dan konversi sudah berhasil
        }

        return {
          lpbData,
        };
      } catch (error) {
        // Jika konversi gagal, hapus file yang sudah diupload
        await prisma.fileUploaded.delete({
          where: { id: fileUploaded.id },
        });
        
        // Hapus file dari filesystem juga
        if (tempFilepath) {
          try {
            await fs.promises.unlink(tempFilepath);
          } catch (unlinkError) {
            logger.warn('Failed to delete temp file', { tempFilepath, error: unlinkError });
          }
        }
        
        throw error;
      }
    } catch (error) {
      // Jika ada error dalam proses upload file, cleanup
      if (tempFilepath) {
        try {
          await fs.promises.unlink(tempFilepath);
        } catch (unlinkError) {
          logger.warn('Failed to delete temp file during cleanup', { tempFilepath, error: unlinkError });
        }
      }
      throw error;
    }
  }

  private static async createLpbFromConvertedData(
    convertedData: any,
    userId?: string
  ) {
    // Mapping converted data ke format yang sesuai untuk LPB
    const lpbData = {
      fppNumber: convertedData.fppNumber,
      orderDate: convertedData.orderDate,
      deliveryDate: convertedData.deliveryDate,
      deliveryTime: convertedData.deliveryTime,
      door: convertedData.door,
      lpbNumber: convertedData.lpbNumber,
      supplier: convertedData.supplier,
      items: convertedData.items,
      pricing: convertedData.pricing,
      payment: convertedData.payment,
      createdBy: userId,
      updatedBy: userId,
    };

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        po_number: convertedData.fppNumber,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const statusId = await prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: 'PENDING LAPORAN PENERIMAAN BARANG',
          category: 'Laporan Penerimaan Barang'
        }
      },
    });


    try {
      const createData: any = {
        tanggal_po: convertedData.orderDate ? new Date(convertedData.orderDate) : null,
        createdBy: userId || 'system',
        updatedBy: userId || 'system',
      };

      if (purchaseOrder) {
        logger.info('Found purchase order for LPB creation', { 
          purchaseOrderId: purchaseOrder.id,
          poNumber: purchaseOrder.po_number 
        });

        createData.purchaseOrder = {
          connect: { id: purchaseOrder.id },
        };
        createData.customer = {
          connect: { id: purchaseOrder.customerId },
        };

        if (purchaseOrder.termin_bayar) {
          createData.termin_bayar = purchaseOrder.termin_bayar;
        }
        if (statusId) {
          createData.status = {
            connect: { id: statusId.id },
          };
        }
      } else {
        logger.warn('Purchase Order not found, creating LPB without purchase order relation', {
          fppNumber: convertedData.fppNumber
        });
      }

      const laporanPenerimaanBarang = await prisma.laporanPenerimaanBarang.create({
        data: createData,
      });

      await createAuditLog('LaporanPenerimaanBarang', laporanPenerimaanBarang.id, ActionType.CREATE, userId || 'system', {
        purchaseOrderId: purchaseOrder?.id ?? null,
        customerId: purchaseOrder?.customerId ?? null,
        statusId: statusId?.id ?? null,
      });

      logger.info('LPB data saved to database', { 
        laporanId: laporanPenerimaanBarang.id,
        lpbData: lpbData 
      });

      return {
        ...lpbData,
        laporanPenerimaanBarangId: laporanPenerimaanBarang.id,
        savedToDatabase: true,
      };
    } catch (error) {
      logger.error('Failed to save LPB data to database', { error, lpbData });
      throw new AppError('Failed to save LPB data to database', 500);
    }
  }
}
