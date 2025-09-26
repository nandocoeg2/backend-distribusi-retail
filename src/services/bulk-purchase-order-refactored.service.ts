import { BaseBulkUploadService, BulkFileData, BulkUploadResult } from './base-bulk-upload.service';
import { ConversionService } from './conversion.service';
import { prisma } from '@/config/database';
import { createAuditLog } from './audit.service';
import { ActionType, POType, Supplier, Customer } from '@prisma/client';
import logger from '@/config/logger';
import { AppError } from '@/utils/app-error';

export class BulkPurchaseOrderRefactoredService extends BaseBulkUploadService {
  protected category = 'purchase_order';

  // Static methods untuk compatibility dengan controller
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
      // Update status ke processing
      for (const fileRecord of fileRecords) {
        await this.updateFileStatus(fileRecord.id, 'PROCESSING BULK PURCHASE ORDER', userId);
      }

      for (const fileRecord of fileRecords) {
        try {
          // Default prompt jika tidak ada
          const defaultPrompt = prompt || 
            'Convert this document into structured JSON format for bulk purchase order processing. ' +
            'Extract relevant information such as order details, supplier information, items, pricing, and payment information.';

          // Konversi file menggunakan ConversionService
          const convertedData = await ConversionService.convertFileToJson(
            fileRecord.buffer,
            fileRecord.mimeType,
            defaultPrompt,
            'bulk-purchase-order'
          );

          // Buat data Purchase Order dari converted data
          try {
            const poData = await this.createPoFromConvertedData(convertedData, userId);
            
            // Hubungkan file dengan Purchase Order yang baru dibuat
            if (poData && poData.purchaseOrderId) {
              await prisma.fileUploaded.update({
                where: { id: fileRecord.id },
                data: {
                  purchaseOrderId: poData.purchaseOrderId,
                },
              });
              
              await createAuditLog('FileUploaded', fileRecord.id, ActionType.UPDATE, userId || 'system', {
                purchaseOrderId: poData.purchaseOrderId,
                bulkId: bulkId,
              });

              // Update status ke completed
              await this.updateFileStatus(fileRecord.id, 'COMPLETED BULK PURCHASE ORDER', userId);
              
              successCount++;
              logger.info('Bulk file processed successfully', {
                fileId: fileRecord.id,
                poId: poData.purchaseOrderId,
                bulkId,
              });
            }
          } catch (poError) {
            logger.warn('Failed to create PO data from converted data in bulk processing', { 
              fileId: fileRecord.id,
              error: poError 
            });
            // Update status ke failed
            await this.updateFileStatus(fileRecord.id, 'FAILED BULK PURCHASE ORDER', userId);
            errorCount++;
          }
        } catch (conversionError) {
          logger.error('Failed to convert file in bulk processing', { 
            fileId: fileRecord.id,
            filename: fileRecord.originalFilename,
            error: conversionError 
          });
          // Update status ke failed
          await this.updateFileStatus(fileRecord.id, 'FAILED BULK PURCHASE ORDER', userId);
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

  private async createPoFromConvertedData(
    convertedData: any,
    userId?: string
  ) {
    // Mapping converted data ke format yang sesuai untuk Purchase Order
    const poData = {
      order: convertedData.order,
      supplier: convertedData.supplier,
      customers: convertedData.customers,
      items: convertedData.items,
      createdBy: userId,
      updatedBy: userId,
    };

    // Cari atau buat supplier
    let supplier: Supplier | null = null;
    if (convertedData.supplier?.name) {
      supplier = await prisma.supplier.findFirst({
        where: {
          name: {
            contains: convertedData.supplier.name,
            mode: 'insensitive'
          }
        }
      });

      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: {
            name: convertedData.supplier.name,
            address: convertedData.supplier.address || '',
            phoneNumber: convertedData.supplier.phone || '',
            email: convertedData.supplier.email || '',
            createdBy: userId || 'system',
            updatedBy: userId || 'system',
          },
        });
      }
    }

    // Cari atau buat customer
    let customer: Customer | null = null;
    if (convertedData.customers?.name) {
      customer = await prisma.customer.findFirst({
        where: {
          namaCustomer: {
            contains: convertedData.customers.name,
            mode: 'insensitive'
          }
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            namaCustomer: convertedData.customers.name,
            kodeCustomer: `CUST-${Date.now()}`,
            groupCustomerId: 'default-group', // You might want to handle this properly
            regionId: 'default-region', // You might want to handle this properly
            alamatPengiriman: convertedData.customers.address || '',
            phoneNumber: convertedData.customers.phone || '',
            email: convertedData.customers.email || '',
            createdBy: userId || 'system',
            updatedBy: userId || 'system',
          },
        });
      }
    }

    // Cari status
    const status = await prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: 'PENDING PURCHASE ORDER',
          category: 'Purchase Order'
        }
      },
    });

    try {
      const createData: any = {
        po_number: convertedData.order?.id || `PO-${Date.now()}`,
        tanggal_masuk_po: convertedData.order?.date ? new Date(convertedData.order.date) : new Date(),
        po_type: POType.SINGLE,
        createdBy: userId || 'system',
        updatedBy: userId || 'system',
      };

      if (supplier) {
        createData.supplier = {
          connect: { id: supplier.id },
        };
      }

      if (customer) {
        createData.customer = {
          connect: { id: customer.id },
        };
      }

      if (status) {
        createData.status = {
          connect: { id: status.id },
        };
      }

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: createData,
      });

      await createAuditLog('PurchaseOrder', purchaseOrder.id, ActionType.CREATE, userId || 'system', {
        supplierId: supplier?.id ?? null,
        statusId: status?.id ?? null,
      });

      logger.info('PO data saved to database', { 
        poId: purchaseOrder.id,
        poData: poData 
      });

      return {
        ...poData,
        purchaseOrderId: purchaseOrder.id,
        savedToDatabase: true,
      };
    } catch (error) {
      logger.error('Failed to save PO data to database', { error, poData });
      throw new AppError('Failed to save PO data to database', 500);
    }
  }
}
