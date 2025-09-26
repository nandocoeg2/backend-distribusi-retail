import { prisma } from '@/config/database';
import { createAuditLog } from './audit.service';
import { ActionType } from '@prisma/client';
import { generateBulkId } from '@/utils/bulk-id.utils';
import logger from '@/config/logger';

export interface BulkFileData {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdBy: string;
}

export interface BulkUploadResult {
  bulkId: string;
  totalFiles: number;
  message: string;
}

export abstract class BaseBulkUploadService {
  protected abstract category: string;
  protected abstract processFilesInBackground(
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
  ): Promise<void>;

  /**
   * Get correct category format for status lookup
   */
  private getStatusCategory(): string {
    const categoryMap: Record<string, string> = {
      'purchase_order': 'Bulk Purchase Order',
      'laporan_penerimaan_barang': 'Bulk Laporan Penerimaan Barang'
    };
    return categoryMap[this.category] || `Bulk ${this.category}`;
  }

  /**
   * Update status file uploaded
   */
  protected async updateFileStatus(
    fileId: string, 
    statusCode: string, 
    userId?: string
  ): Promise<void> {
    try {
      const status = await prisma.status.findUnique({
        where: {
          status_code_category: {
            status_code: statusCode,
            category: this.getStatusCategory()
          }
        }
      });

      if (status) {
        await prisma.fileUploaded.update({
          where: { id: fileId },
          data: { statusId: status.id }
        });

        await createAuditLog('FileUploaded', fileId, ActionType.UPDATE, userId || 'system', {
          statusId: status.id,
          statusCode: statusCode,
        });

        logger.info(`File status updated`, {
          fileId,
          statusCode,
          category: this.category
        });
      } else {
        logger.warn(`Status not found`, {
          statusCode,
          category: this.getStatusCategory(),
          fileId
        });
      }
    } catch (error) {
      logger.error(`Failed to update file status`, {
        fileId,
        statusCode,
        error
      });
    }
  }

  async uploadBulkFilesAndProcess(
    files: BulkFileData[],
    prompt?: string,
    userId?: string
  ): Promise<BulkUploadResult> {
    try {
      // Generate bulk ID untuk tracking
      const bulkId = generateBulkId(this.category);

      // Cari status pending untuk kategori ini
      const pendingStatus = await prisma.status.findUnique({
        where: {
          status_code_category: {
            status_code: `PENDING BULK ${this.category.toUpperCase()}`,
            category: this.getStatusCategory()
          }
        }
      });

      // Simpan file records ke database
      const fileRecords: Array<{
        id: string;
        path: string;
        buffer: Buffer;
        mimeType: string;
        originalFilename: string;
      }> = [];

      for (const file of files) {
        try {
          // Buat file uploaded record dengan status pending
          const fileUploaded = await prisma.fileUploaded.create({
            data: {
              filename: file.filename,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
              category: this.category,
              bulkId: bulkId,
              createdBy: file.createdBy,
              statusId: pendingStatus?.id, // Set status pending
            },
          });

          // Baca file untuk background processing
          const buffer = await require('fs').promises.readFile(file.path);

          fileRecords.push({
            id: fileUploaded.id,
            path: file.path,
            buffer: buffer,
            mimeType: file.mimetype,
            originalFilename: file.filename,
          });

          await createAuditLog('FileUploaded', fileUploaded.id, ActionType.CREATE, userId || 'system', {
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            category: this.category,
            bulkId: bulkId,
            statusId: pendingStatus?.id,
          });
        } catch (fileError) {
          logger.error(`Failed to save file in bulk upload for ${this.category}`, { 
            filename: file.filename, 
            error: fileError 
          });
        }
      }

      // Proses file di background (async)
      this.processFilesInBackground(fileRecords, bulkId, prompt, userId);

      return {
        bulkId: bulkId,
        totalFiles: fileRecords.length,
        message: `Bulk upload berhasil. ${fileRecords.length} file akan diproses di background.`
      };
    } catch (error) {
      logger.error(`Failed to upload bulk files for ${this.category}`, { error });
      throw new Error(`Failed to upload bulk files for ${this.category}`);
    }
  }

  async getBulkProcessingStatus(bulkId: string) {
    // Cari file yang terkait dengan bulk ID ini
    const files = await prisma.fileUploaded.findMany({
      where: {
        bulkId: bulkId,
        category: this.category,
      },
      select: {
        id: true,
        filename: true,
        laporanPenerimaanBarangId: true,
        purchaseOrderId: true,
        createdAt: true,
        path: true,
        status: {
          select: {
            status_code: true,
            status_name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (files.length === 0) {
      throw new Error('Bulk not found');
    }

    // Hitung statistik berdasarkan status
    const statusCounts = files.reduce((acc, file) => {
      const statusCode = file.status?.status_code || 'PENDING BULK';
      acc[statusCode] = (acc[statusCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const processedField = this.category === 'purchase_order' ? 'purchaseOrderId' : 'laporanPenerimaanBarangId';
    const processedFiles = files.filter(f => f[processedField as keyof typeof f]).length;
    const successFiles = statusCounts[`COMPLETED BULK ${this.category.toUpperCase()}`] || 0;
    const errorFiles = statusCounts[`FAILED BULK ${this.category.toUpperCase()}`] || 0;
    const processingFiles = statusCounts[`PROCESSING BULK ${this.category.toUpperCase()}`] || 0;
    const pendingFiles = statusCounts[`PENDING BULK ${this.category.toUpperCase()}`] || 0;

    // Tentukan status overall berdasarkan progress
    let overallStatus = `PENDING BULK ${this.category.toUpperCase()}`;
    if (processingFiles > 0) {
      overallStatus = `PROCESSING BULK ${this.category.toUpperCase()}`;
    } else if (successFiles === files.length) {
      overallStatus = `COMPLETED BULK ${this.category.toUpperCase()}`;
    } else if (errorFiles > 0 && successFiles + errorFiles === files.length) {
      overallStatus = `FAILED BULK ${this.category.toUpperCase()}`;
    }

    return {
      bulkId: bulkId,
      type: this.category.toUpperCase(),
      status: overallStatus,
      totalFiles: files.length,
      processedFiles: processedFiles,
      successFiles: successFiles,
      errorFiles: errorFiles,
      processingFiles: processingFiles,
      pendingFiles: pendingFiles,
      createdAt: files[0]?.createdAt,
      completedAt: successFiles === files.length ? new Date() : null,
      statusBreakdown: statusCounts,
      files: files,
    };
  }

  async getAllBulkFiles(status?: string) {
    const whereClause: any = {
      bulkId: { not: null },
      category: this.category,
    };

    if (status) {
      const processedField = this.category === 'purchase_order' ? 'purchaseOrderId' : 'laporanPenerimaanBarangId';
      whereClause[processedField] = status === 'processed' ? { not: null } : null;
    }

    const files = await prisma.fileUploaded.findMany({
      where: whereClause,
      select: {
        id: true,
        filename: true,
        path: true,
        mimetype: true,
        size: true,
        category: true,
        bulkId: true,
        purchaseOrderId: true,
        laporanPenerimaanBarangId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        status: {
          select: {
            status_code: true,
            status_name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return files;
  }
}
