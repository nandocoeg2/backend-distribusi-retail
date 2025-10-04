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
import {
  BaseBulkUploadService,
  BulkFileData,
  BulkUploadResult,
} from './base-bulk-upload.service';
import { generateBulkLpbId } from '@/utils/bulk-id.utils';

const LPB_INCLUDE_RELATIONS = {
  purchaseOrder: true,
  customer: true,
  termOfPayment: true,
  status: true,
  files: true,
} satisfies Prisma.LaporanPenerimaanBarangInclude;

const LPB_COMPLETED_STATUS_CODE = 'COMPLETED LAPORAN PENERIMAAN BARANG';
const PO_COMPLETED_STATUS_CODE = 'COMPLETED PURCHASE ORDER';

type LaporanPenerimaanBarangWithRelations =
  Prisma.LaporanPenerimaanBarangGetPayload<{
    include: typeof LPB_INCLUDE_RELATIONS;
  }>;
export class LaporanPenerimaanBarangBulkService extends BaseBulkUploadService {
  protected category = 'laporan_penerimaan_barang';

  protected async processFilesInBackground(
    fileRecords: Array<{
      id: string;
      path: string;
      buffer: Buffer;
      mimeType: string;
      originalFilename: string;
    }>,
    bulkId: string,
    prompt?: string,
    userId?: string
  ): Promise<void> {
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      // Update status ke processing
      for (const fileRecord of fileRecords) {
        await this.updateFileStatus(
          fileRecord.id,
          'PROCESSING BULK LAPORAN PENERIMAAN BARANG',
          userId
        );
      }

      for (const fileRecord of fileRecords) {
        try {
          // Default prompt jika tidak ada
          const defaultPrompt =
            prompt ||
            'Convert this document into structured JSON format for goods receipt report. ' +
              'Extract relevant information such as FPP number, order date, delivery details, supplier information, items, pricing, and payment information.';

          // Konversi file menggunakan ConversionService
          const convertedData = await ConversionService.convertFileToJson(
            fileRecord.buffer,
            fileRecord.mimeType,
            defaultPrompt,
            'laporan-penerimaan-barang'
          );

          // Buat data LPB dari converted data
          try {
            const bulkService = new LaporanPenerimaanBarangBulkService();
            const lpbData = await bulkService.createLpbFromConvertedData(
              convertedData,
              userId
            );

            // Hubungkan file dengan LPB yang baru dibuat
            if (lpbData && lpbData.laporanPenerimaanBarangId) {
              await prisma.fileUploaded.update({
                where: { id: fileRecord.id },
                data: {
                  laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
                },
              });

              await createAuditLog(
                'FileUploaded',
                fileRecord.id,
                ActionType.UPDATE,
                userId || 'system',
                {
                  laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
                  bulkId: bulkId,
                }
              );

              // Update status ke completed
              await this.updateFileStatus(
                fileRecord.id,
                'COMPLETED BULK LAPORAN PENERIMAAN BARANG',
                userId
              );

              successCount++;
              logger.info('Bulk file processed successfully', {
                fileId: fileRecord.id,
                lpbId: lpbData.laporanPenerimaanBarangId,
                bulkId,
              });
            }
          } catch (lpbError) {
            logger.warn(
              'Failed to create LPB data from converted data in bulk processing',
              {
                fileId: fileRecord.id,
                error: lpbError,
              }
            );
            // Update status ke failed
            await this.updateFileStatus(
              fileRecord.id,
              'FAILED BULK LAPORAN PENERIMAAN BARANG',
              userId
            );
            errorCount++;
          }
        } catch (conversionError) {
          logger.error('Failed to convert file in bulk processing', {
            fileId: fileRecord.id,
            filename: fileRecord.originalFilename,
            error: conversionError,
          });
          // Update status ke failed
          await this.updateFileStatus(
            fileRecord.id,
            'FAILED BULK LAPORAN PENERIMAAN BARANG',
            userId
          );
          errorCount++;
        }

        processedCount++;

        // Log progress setiap 10 file
        if (processedCount % 10 === 0) {
          logger.info('Bulk processing progress', {
            bulkId,
            processedFiles: processedCount,
            successFiles: successCount,
            errorFiles: errorCount,
            totalFiles: fileRecords.length,
          });
        }
      }

      logger.info('Bulk processing completed', {
        bulkId,
        totalFiles: fileRecords.length,
        processedFiles: processedCount,
        successFiles: successCount,
        errorFiles: errorCount,
      });
    } catch (error) {
      logger.error('Bulk processing failed', { bulkId, error });
    }
  }

  public async createLpbFromConvertedData(convertedData: any, userId?: string) {
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
          category: 'Laporan Penerimaan Barang',
        },
      },
    });

    try {
      const createData: any = {
        tanggal_po: convertedData.orderDate
          ? new Date(convertedData.orderDate)
          : null,
        createdBy: userId || 'system',
        updatedBy: userId || 'system',
      };

      if (purchaseOrder) {
        logger.info('Found purchase order for LPB creation', {
          purchaseOrderId: purchaseOrder.id,
          poNumber: purchaseOrder.po_number,
        });

        createData.purchaseOrder = {
          connect: { id: purchaseOrder.id },
        };
        createData.customer = {
          connect: { id: purchaseOrder.customerId },
        };

        if (purchaseOrder.termin_bayar) {
          createData.termOfPayment = {
            connect: { id: purchaseOrder.termin_bayar },
          };
        }
        if (statusId) {
          createData.status = {
            connect: { id: statusId.id },
          };
        }
      } else {
        logger.warn(
          'Purchase Order not found, creating LPB without purchase order relation',
          {
            fppNumber: convertedData.fppNumber,
          }
        );
      }

      const laporanPenerimaanBarang =
        await prisma.laporanPenerimaanBarang.create({
          data: createData,
        });

      await createAuditLog(
        'LaporanPenerimaanBarang',
        laporanPenerimaanBarang.id,
        ActionType.CREATE,
        userId || 'system',
        {
          purchaseOrderId: purchaseOrder?.id ?? null,
          customerId: purchaseOrder?.customerId ?? null,
          statusId: statusId?.id ?? null,
          termOfPaymentId: purchaseOrder?.termin_bayar ?? null,
        }
      );

      logger.info('LPB data saved to database', {
        laporanId: laporanPenerimaanBarang.id,
        lpbData: lpbData,
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

export class LaporanPenerimaanBarangService extends BaseService<
  LaporanPenerimaanBarang,
  CreateLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput['body']
> {
  protected modelName = 'LaporanPenerimaanBarang';
  protected tableName = 'LaporanPenerimaanBarang';
  protected prismaModel = prisma.laporanPenerimaanBarang;

  private static includeRelations = LPB_INCLUDE_RELATIONS;

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
        files:
          files && files.length > 0
            ? { connect: files.map((id) => ({ id })) }
            : undefined,
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
          status_code: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
    ];

    return service.searchEntities(filters, page, limit, this.includeRelations);
  }

  static async processLaporanPenerimaanBarang(
    ids: string[],
    userId: string
  ): Promise<{
    success: LaporanPenerimaanBarangWithRelations[];
    failed: {
      id: string;
      error: string;
      details?: Record<string, unknown>;
    }[];
  }> {
    const results = {
      success: [] as LaporanPenerimaanBarangWithRelations[],
      failed: [] as {
        id: string;
        error: string;
        details?: Record<string, unknown>;
      }[],
    };

    for (const id of ids) {
      try {
        const processed = await this.processSingleLaporanPenerimaanBarang(
          id,
          userId
        );
        results.success.push(processed);
      } catch (error) {
        const message =
          error instanceof AppError
            ? error.message
            : 'Unknown error occurred while processing LPB';
        const failure: {
          id: string;
          error: string;
          details?: Record<string, unknown>;
        } = {
          id,
          error: message,
        };

        if (error instanceof AppError && error.details) {
          failure.details = error.details;
        }

        logger.warn('Failed to process LPB', {
          lpbId: id,
          error,
        });

        results.failed.push(failure);
      }
    }

    return results;
  }

  static async completeLaporanPenerimaanBarang(
    ids: string[],
    userId: string
  ): Promise<{
    success: LaporanPenerimaanBarangWithRelations[];
    failed: {
      id: string;
      error: string;
      details?: Record<string, unknown>;
    }[];
  }> {
    const actorId = userId || 'system';

    const [completedLaporanStatus, completedPurchaseOrderStatus] =
      await Promise.all([
        prisma.status.findUnique({
          where: {
            status_code_category: {
              status_code: LPB_COMPLETED_STATUS_CODE,
              category: 'Laporan Penerimaan Barang',
            },
          },
        }),
        prisma.status.findUnique({
          where: {
            status_code_category: {
              status_code: PO_COMPLETED_STATUS_CODE,
              category: 'Purchase Order',
            },
          },
        }),
      ]);

    if (!completedLaporanStatus) {
      throw new AppError(
        'COMPLETED LAPORAN PENERIMAAN BARANG status not found',
        404,
        {
          status_code: LPB_COMPLETED_STATUS_CODE,
        }
      );
    }

    if (!completedPurchaseOrderStatus) {
      throw new AppError('COMPLETED PURCHASE ORDER status not found', 404, {
        status_code: PO_COMPLETED_STATUS_CODE,
      });
    }

    const results = {
      success: [] as LaporanPenerimaanBarangWithRelations[],
      failed: [] as {
        id: string;
        error: string;
        details?: Record<string, unknown>;
      }[],
    };

    for (const id of ids) {
      try {
        const completed = await this.completeSingleLaporanPenerimaanBarang(
          id,
          actorId,
          completedLaporanStatus.id,
          completedPurchaseOrderStatus.id
        );
        results.success.push(completed);
      } catch (error) {
        const message =
          error instanceof AppError
            ? error.message
            : 'Unknown error occurred while completing LPB';
        const failure: {
          id: string;
          error: string;
          details?: Record<string, unknown>;
        } = {
          id,
          error: message,
        };

        if (error instanceof AppError && error.details) {
          failure.details = error.details;
        }

        logger.warn('Failed to complete LPB', {
          lpbId: id,
          error,
        });

        results.failed.push(failure);
      }
    }

    return results;
  }

  private static async completeSingleLaporanPenerimaanBarang(
    id: string,
    userId: string,
    completedStatusId: string,
    completedPurchaseOrderStatusId: string
  ): Promise<LaporanPenerimaanBarangWithRelations> {
    const laporan = await prisma.laporanPenerimaanBarang.findUnique({
      where: { id },
      include: LPB_INCLUDE_RELATIONS,
    });

    if (!laporan) {
      throw new AppError('Laporan Penerimaan Barang not found', 404);
    }

    if (!laporan.purchaseOrderId) {
      throw new AppError(
        'Purchase order must be linked before completing LPB',
        400,
        { field: 'purchaseOrderId' }
      );
    }

    if (!laporan.purchaseOrder) {
      throw new AppError('Linked Purchase Order not found', 404, {
        purchaseOrderId: laporan.purchaseOrderId,
      });
    }

    const previousLaporanStatusId = laporan.statusId;
    const previousPurchaseOrderStatusId = laporan.purchaseOrder.statusId;

    if (
      previousLaporanStatusId === completedStatusId &&
      previousPurchaseOrderStatusId === completedPurchaseOrderStatusId
    ) {
      logger.info('LPB already completed', { lpbId: id });
      return laporan;
    }

    const { updatedLaporan, updatedPurchaseOrder } = await prisma.$transaction(
      async (tx) => {
        const updatedPurchaseOrder = await tx.purchaseOrder.update({
          where: { id: laporan.purchaseOrder!.id },
          data: {
            statusId: completedPurchaseOrderStatusId,
            updatedBy: userId,
          },
        });

        const updatedLaporan = await tx.laporanPenerimaanBarang.update({
          where: { id },
          data: {
            statusId: completedStatusId,
            updatedBy: userId,
          },
          include: LPB_INCLUDE_RELATIONS,
        });

        return { updatedLaporan, updatedPurchaseOrder };
      }
    );

    await createAuditLog(
      'PurchaseOrder',
      laporan.purchaseOrder.id,
      ActionType.UPDATE,
      userId,
      {
        action: 'CompletePurchaseOrderFromLpb',
        previousStatusId: previousPurchaseOrderStatusId,
        newStatusId: updatedPurchaseOrder.statusId,
        laporanPenerimaanBarangId: id,
      }
    );

    await createAuditLog(
      'LaporanPenerimaanBarang',
      updatedLaporan.id,
      ActionType.UPDATE,
      userId,
      {
        action: 'CompleteLaporanPenerimaanBarang',
        previousStatusId: previousLaporanStatusId,
        newStatusId: updatedLaporan.statusId,
      }
    );

    logger.info('LPB completed and purchase order status updated', {
      lpbId: id,
      purchaseOrderId: laporan.purchaseOrder.id,
      previousLaporanStatusId,
      newLaporanStatusId: updatedLaporan.statusId,
      previousPurchaseOrderStatusId,
      newPurchaseOrderStatusId: updatedPurchaseOrder.statusId,
    });

    return updatedLaporan;
  }

  private static async processSingleLaporanPenerimaanBarang(
    id: string,
    userId: string
  ): Promise<LaporanPenerimaanBarangWithRelations> {
    const laporan = await prisma.laporanPenerimaanBarang.findUnique({
      where: { id },
      include: LPB_INCLUDE_RELATIONS,
    });

    if (!laporan) {
      throw new AppError('Laporan Penerimaan Barang not found', 404);
    }

    if (!laporan.purchaseOrderId) {
      throw new AppError(
        'Purchase order must be linked before processing LPB',
        400,
        { field: 'purchaseOrderId' }
      );
    }

    if (!laporan.tanggal_po) {
      throw new AppError(
        'Purchase order date (tanggal_po) is required before processing LPB',
        400,
        { field: 'tanggal_po' }
      );
    }

    if (!laporan.customerId) {
      throw new AppError('Customer must be linked before processing LPB', 400, {
        field: 'customerId',
      });
    }

    if (!laporan.termin_bayar) {
      throw new AppError(
        'Term of payment (termin_bayar) is required before processing LPB',
        400,
        { field: 'termin_bayar' }
      );
    }

    const processingStatus = await prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: 'PROCESSING LAPORAN PENERIMAAN BARANG',
          category: 'Laporan Penerimaan Barang',
        },
      },
    });

    if (!processingStatus) {
      throw new AppError(
        'PROCESSING LAPORAN PENERIMAAN BARANG status not found',
        404,
        { status_code: 'PROCESSING LAPORAN PENERIMAAN BARANG' }
      );
    }

    if (laporan.statusId === processingStatus.id) {
      logger.info('LPB already in processing status', { lpbId: id });
      return laporan;
    }

    const updated = await prisma.laporanPenerimaanBarang.update({
      where: { id },
      data: {
        statusId: processingStatus.id,
        updatedBy: userId || 'system',
      },
      include: LPB_INCLUDE_RELATIONS,
    });

    await createAuditLog(
      'LaporanPenerimaanBarang',
      updated.id,
      ActionType.UPDATE,
      userId || 'system',
      {
        action: 'ProcessLaporanPenerimaanBarang',
        previousStatusId: laporan.statusId,
        newStatusId: processingStatus.id,
      }
    );

    logger.info('LPB moved to processing status', {
      lpbId: id,
      previousStatusId: laporan.statusId,
      newStatusId: processingStatus.id,
    });

    return updated;
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
        throw new AppError(
          'One or more files are already linked to another report',
          400
        );
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
      const uploadDir = path.join(
        process.cwd(),
        'fileuploaded',
        'laporan-penerimaan-barang',
        today
      );
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
      await createAuditLog(
        'FileUploaded',
        fileUploaded.id,
        ActionType.CREATE,
        userId || 'system',
        {
          filename: originalFilename,
          path: filepath,
          mimetype: mimeType,
          size: stats.size,
        }
      );

      // Default prompt jika tidak ada
      const defaultPrompt =
        prompt ||
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
          const bulkService = new LaporanPenerimaanBarangBulkService();
          lpbData = await bulkService.createLpbFromConvertedData(
            convertedData,
            userId
          );

          // Hubungkan file dengan LPB yang baru dibuat
          if (lpbData && lpbData.laporanPenerimaanBarangId) {
            await prisma.fileUploaded.update({
              where: { id: fileUploaded.id },
              data: {
                laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
              },
            });
            await createAuditLog(
              'FileUploaded',
              fileUploaded.id,
              ActionType.UPDATE,
              userId || 'system',
              {
                laporanPenerimaanBarangId: lpbData.laporanPenerimaanBarangId,
              }
            );

            logger.info('File connected to LPB', {
              fileId: fileUploaded.id,
              lpbId: lpbData.laporanPenerimaanBarangId,
            });
          }
        } catch (lpbError) {
          logger.warn('Failed to create LPB data from converted data', {
            error: lpbError,
          });
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
            logger.warn('Failed to delete temp file', {
              tempFilepath,
              error: unlinkError,
            });
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
          logger.warn('Failed to delete temp file during cleanup', {
            tempFilepath,
            error: unlinkError,
          });
        }
      }
      throw error;
    }
  }

  // Static methods untuk bulk upload menggunakan service terpisah
  static async uploadBulkFilesAndProcess(
    files: BulkFileData[],
    prompt?: string,
    userId?: string
  ): Promise<BulkUploadResult> {
    const bulkService = new LaporanPenerimaanBarangBulkService();
    return bulkService.uploadBulkFilesAndProcess(files, prompt, userId);
  }

  static async getBulkProcessingStatus(bulkId: string) {
    const bulkService = new LaporanPenerimaanBarangBulkService();
    return bulkService.getBulkProcessingStatus(bulkId);
  }

  static async getAllBulkFiles(status?: string) {
    const bulkService = new LaporanPenerimaanBarangBulkService();
    return bulkService.getAllBulkFiles(status);
  }
}
