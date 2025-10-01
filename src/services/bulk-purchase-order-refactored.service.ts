import {
  BaseBulkUploadService,
  BulkFileData,
  BulkUploadResult,
} from './base-bulk-upload.service';
import { ConversionService } from './conversion.service';
import { prisma } from '@/config/database';
import { createAuditLog } from './audit.service';
import { ActionType } from '@prisma/client';
import logger from '@/config/logger';
import { AppError } from '@/utils/app-error';
import {
  buildPrompt,
  unwrapPayload,
  normalizeItems,
  normalizeInvoice,
  parseOrderDate,
  resolveTermOfPaymentForSupplier,
  normalizePoType,
  resolveSupplier,
  resolveCustomer,
  fetchDefaultStatus,
  buildCreateData,
  persistPurchaseOrder,
} from './bulk-purchase-order.helpers';

export class BulkPurchaseOrderRefactoredService extends BaseBulkUploadService {
  protected category = 'purchase_order';

  static async uploadBulkFilesAndProcess(
    files: BulkFileData[],
    prompt?: string,
    userId?: string
  ): Promise<BulkUploadResult> {
    const instance = new BulkPurchaseOrderRefactoredService();
    return instance.uploadBulkFilesAndProcess(files, prompt, userId);
  }

  static async getBulkProcessingStatus(bulkId: string) {
    const instance = new BulkPurchaseOrderRefactoredService();
    return instance.getBulkProcessingStatus(bulkId);
  }

  static async getAllBulkFiles(status?: string) {
    const instance = new BulkPurchaseOrderRefactoredService();
    return instance.getAllBulkFiles(status);
  }

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
      await this.markFilesAsProcessing(fileRecords, userId);
      const effectivePrompt = buildPrompt(prompt);

      for (const fileRecord of fileRecords) {
        const outcome = await this.processSingleFile(
          fileRecord,
          bulkId,
          effectivePrompt,
          userId
        );

        processedCount++;
        if (outcome === 'success') {
          successCount++;
        } else {
          errorCount++;
        }

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

  private async markFilesAsProcessing(
    fileRecords: Array<{ id: string }>,
    userId?: string
  ) {
    for (const fileRecord of fileRecords) {
      await this.updateFileStatus(
        fileRecord.id,
        'PROCESSING BULK PURCHASE ORDER',
        userId
      );
    }
  }

  private async processSingleFile(
    fileRecord: {
      id: string;
      buffer: Buffer;
      mimeType: string;
      originalFilename: string;
    },
    bulkId: string,
    prompt: string,
    userId?: string
  ): Promise<'success' | 'failed'> {
    try {
      const convertedData = await ConversionService.convertFileToJson(
        fileRecord.buffer,
        fileRecord.mimeType,
        prompt,
        'bulk-purchase-order'
      );

      const poData = await this.createPoFromConvertedData(
        convertedData,
        userId
      );

      if (poData?.purchaseOrderId) {
        await prisma.fileUploaded.update({
          where: { id: fileRecord.id },
          data: {
            purchaseOrderId: poData.purchaseOrderId,
          },
        });

        await createAuditLog(
          'FileUploaded',
          fileRecord.id,
          ActionType.UPDATE,
          userId || 'system',
          {
            purchaseOrderId: poData.purchaseOrderId,
            bulkId,
          }
        );

        await this.updateFileStatus(
          fileRecord.id,
          'COMPLETED BULK PURCHASE ORDER',
          userId
        );

        logger.info('Bulk file processed successfully', {
          fileId: fileRecord.id,
          poId: poData.purchaseOrderId,
          bulkId,
        });

        return 'success';
      }

      await this.updateFileStatus(
        fileRecord.id,
        'FAILED BULK PURCHASE ORDER',
        userId
      );
      logger.warn('Converted data did not produce a purchase order', {
        fileId: fileRecord.id,
        bulkId,
      });
      return 'failed';
    } catch (error) {
      await this.updateFileStatus(
        fileRecord.id,
        'FAILED BULK PURCHASE ORDER',
        userId
      );

      const logContext = {
        fileId: fileRecord.id,
        filename: fileRecord.originalFilename,
        bulkId,
        error,
      };

      if (error instanceof AppError) {
        logger.warn(
          'Failed to create PO data from converted data in bulk processing',
          logContext
        );
      } else {
        logger.error('Failed to convert file in bulk processing', logContext);
      }

      return 'failed';
    }
  }

  private async createPoFromConvertedData(convertedData: any, userId?: string) {
    const payload = unwrapPayload(convertedData);
    const orderPayload = (payload?.order ?? {}) as Record<string, unknown>;
    const supplierPayload = payload?.supplier;
    const customerPayload = payload?.customers;

    const { normalizedItems, detailInputs, totalItems } = normalizeItems(payload);

    const orderDateRaw = (orderPayload as { date?: unknown }).date;
    const orderTypeRaw = (orderPayload as { type?: unknown }).type;
    const orderIdRaw = (orderPayload as { id?: unknown }).id;

    const parsedOrderDate = parseOrderDate(orderDateRaw);
    const invoice = normalizeInvoice(payload?.invoice);
    const poType = normalizePoType(orderTypeRaw);

    const supplierCodeFromPayload =
      supplierPayload && typeof supplierPayload === 'object'
        ? (supplierPayload as Record<string, unknown>).code
        : undefined;

    const supplier = await resolveSupplier(supplierPayload, userId);

    const { termOfPayment, attemptedCodes } =
      await resolveTermOfPaymentForSupplier({
        supplierPayload,
        supplierRecord: supplier,
      });

    const termOfPaymentCode =
      termOfPayment?.kode_top ?? attemptedCodes[0] ?? null;

    if (!termOfPayment && attemptedCodes.length > 0) {
      const supplierCodeForLog =
        (typeof supplierCodeFromPayload === 'string' && supplierCodeFromPayload) ||
        supplier?.code ||
        null;

      logger.warn('Term of payment not found for derived supplier code', {
        attemptedCodes,
        supplierCode: supplierCodeForLog,
      });
    }

    const customer = await resolveCustomer(customerPayload, userId);
    if (!customer) {
      const recordId =
        typeof orderIdRaw === 'string' && orderIdRaw.trim().length > 0
          ? orderIdRaw
          : 'BULK-PO-' + Date.now();

      await createAuditLog(
        'PurchaseOrder',
        recordId,
        ActionType.UPDATE,
        userId || 'system',
        {
          reason: 'Customer resolution failed during bulk PO processing',
          orderId: orderIdRaw ?? null,
          customerPayload,
        }
      );

      throw new AppError(
        'Data pelanggan pada file tidak lengkap. Nama atau kode pelanggan wajib ada.',
        400
      );
    }
    const status = await fetchDefaultStatus();

    const tanggalBatasKirim =
      termOfPayment !== null
        ? new Date(
            parsedOrderDate.getTime() +
              termOfPayment.batas_hari * 24 * 60 * 60 * 1000
          )
        : undefined;

    const existingOrder = orderPayload as Record<string, unknown>;
    const existingTerminBayar = existingOrder.termin_bayar as string | null | undefined;
    const existingTanggalBatasKirim =
      existingOrder.tanggal_batas_kirim as string | null | undefined;

    const poData = {
      order: {
        ...orderPayload,
        parsedDate: parsedOrderDate.toISOString(),
        termin_bayar: termOfPayment?.id ?? existingTerminBayar ?? null,
        tanggal_batas_kirim: tanggalBatasKirim
          ? tanggalBatasKirim.toISOString()
          : existingTanggalBatasKirim ?? null,
      },
      supplier: supplierPayload,
      customers: customerPayload,
      items: normalizedItems,
      invoice,
      total_items: totalItems,
      createdBy: userId,
      updatedBy: userId,
    };

    const createData = buildCreateData({
      poNumber: orderIdRaw,
      parsedOrderDate,
      poType,
      totalItems,
      hasDetails: detailInputs.length > 0,
      supplier,
      customer,
      status,
      termOfPayment,
      existingTermOfPaymentId:
        typeof existingTerminBayar === 'string' && existingTerminBayar.trim().length > 0
          ? existingTerminBayar
          : undefined,
      tanggalBatasKirim,
      userId,
    });

    const { purchaseOrder, persistedDetails } = await persistPurchaseOrder({
      createData,
      detailInputs,
      userId,
    });

    await createAuditLog(
      'PurchaseOrder',
      purchaseOrder.id,
      ActionType.CREATE,
      userId || 'system',
      {
        supplierId: supplier?.id ?? null,
        statusId: status?.id ?? null,
        termOfPaymentId: termOfPayment?.id ?? null,
      }
    );

    logger.info('PO data saved to database', {
      poId: purchaseOrder.id,
      poNumber: purchaseOrder.po_number,
      totalItems,
      termOfPaymentCode,
    });

    return {
      ...poData,
      order: {
        ...(poData.order ?? {}),
        po_number: purchaseOrder.po_number,
        type: poType,
        originalType: orderTypeRaw,
      },
      purchaseOrderId: purchaseOrder.id,
      purchaseOrderDetails:
        persistedDetails.length > 0 ? persistedDetails : detailInputs,
      supplierRecord: supplier
        ? {
            id: supplier.id,
            name: supplier.name,
            code: supplier.code,
            phoneNumber: supplier.phoneNumber,
            bank: supplier.bank,
          }
        : null,
      customerRecord: customer
        ? {
            id: customer.id,
            namaCustomer: customer.namaCustomer,
            kodeCustomer: customer.kodeCustomer,
            alamatPengiriman: customer.alamatPengiriman,
            phoneNumber: customer.phoneNumber,
          }
        : null,
      termOfPaymentRecord: termOfPayment
        ? {
            id: termOfPayment.id,
            kode_top: termOfPayment.kode_top,
            batas_hari: termOfPayment.batas_hari,
          }
        : null,
      savedToDatabase: true,
    };
  }
}


