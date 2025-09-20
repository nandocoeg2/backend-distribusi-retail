import { prisma } from '@/config/database';
import { ConversionService } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';
import logger from '@/config/logger';
import fs from 'fs/promises';
import { POType, Supplier, Prisma } from '@prisma/client';
import { NotificationService } from './notification.service';
import { createAuditLog } from './audit.service';

export class BulkPurchaseOrderService {
  static async processPendingFiles() {
    const pendingFiles = await prisma.fileUploaded.findMany({
      where: {
        status: {
          status_code: { in: ['PENDING BULK FILE', 'FAILED BULK FILE'] },
        },
        purchaseOrderId: null,
      },
    });

    if (pendingFiles.length === 0) {
      return;
    }

    const poPendingStatus = await prisma.status.findUnique({ where: { status_code: 'PENDING PURCHASE ORDER' } });
    const fileProcessingStatus = await prisma.status.findUnique({ where: { status_code: 'PROCESSING BULK FILE' } });
    const fileProcessedStatus = await prisma.status.findUnique({ where: { status_code: 'PROCESSED BULK FILE' } });
    const fileFailedStatus = await prisma.status.findUnique({ where: { status_code: 'FAILED BULK FILE' } });

    if (!poPendingStatus || !fileProcessingStatus || !fileProcessedStatus || !fileFailedStatus) {
      logger.error('Core statuses for bulk processing not found. Aborting.');
      return;
    }

    for (const file of pendingFiles) {
      const userId = (file as any).createdBy;

      if (!userId) {
        logger.warn(`File ${file.id} has no creator. Marking as failed.`);
        await prisma.fileUploaded.update({
          where: { id: file.id },
          data: { statusId: fileFailedStatus.id },
        });
        continue;
      }

      try {
        await prisma.fileUploaded.update({
          where: { id: file.id },
          data: { statusId: fileProcessingStatus.id },
        });
        logger.info(`Locked file ${file.id} for processing.`);

        const fileBuffer = await fs.readFile(file.path);
        const jsonResult: any = await ConversionService.convertFileToJson(
          fileBuffer,
          file.mimetype,
          'extract purchase order details as json'
        );

        let newPurchaseOrder: any;
        let poDetails: Array<{ plu: string; nama_barang: string; harga: number; harga_netto: number; }> = [];

        await prisma.$transaction(async (tx) => {
          const poNumber = jsonResult.order?.id;
          if (!poNumber) throw new Error('Conversion result missing PO number.');

          const customerName = jsonResult.customers?.name;
          if (!customerName) throw new Error('Customer name missing from file.');

          let customer = await tx.customer.findFirst({ where: { namaCustomer: { contains: customerName, mode: 'insensitive' } } });
          if (!customer) {
            // This is a simplified customer creation. In a real-world scenario, you might need more data.
            customer = await tx.customer.create({
              data: {
                namaCustomer: customerName,
                kodeCustomer: `CUST-${customerName.toUpperCase().replace(/\s/g, '-')}`,
                alamatPengiriman: 'N/A',
                phoneNumber: 'N/A',
                groupCustomerId: 'a2cbe890-1c19-4586-9c16-9f15031b2649', // Default Group Customer
                regionId: 'f7c8b4b0-1c19-4586-9c16-9f15031b2649', // Default Region
                createdBy: userId,
                updatedBy: userId,
              },
            });
          }

          let supplier: Supplier | null = null;
          if (jsonResult.supplier?.code) {
            supplier = await tx.supplier.findUnique({ where: { code: jsonResult.supplier.code } });
          }

          const orderDateStr = jsonResult.order?.date;
          let parsedOrderDate = new Date();
          if (orderDateStr) {
            const [day, monthStr, yearAbbr] = orderDateStr.split('-');
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const month = months.indexOf(monthStr.toUpperCase());
            if (day && month > -1 && yearAbbr) {
              parsedOrderDate = new Date(parseInt(yearAbbr, 10) + 2000, month, parseInt(day, 10));
            }
          }

          newPurchaseOrder = await tx.purchaseOrder.create({
            data: {
              po_number: poNumber,
              customerId: customer.id,
              supplierId: supplier?.id,
              total_items: jsonResult.items?.length || 0,
              tanggal_masuk_po: parsedOrderDate,
              po_type: POType.BULK,
              statusId: poPendingStatus.id,
              createdBy: userId,
              updatedBy: userId,
            },
          });

          if (!jsonResult.items || !Array.isArray(jsonResult.items)) {
            throw new Error('Items array is missing or invalid in the conversion result.');
          }

          for (const item of jsonResult.items) {
            const inventoryItem = await tx.inventory.upsert({
              where: { plu: item.plu },
              create: {
                plu: item.plu,
                nama_barang: item.productName,
                stok_c: item.qtyOrdered_carton || 0,
                stok_q: 0, // NOTE: stok_q (pcs) is not available in bulk upload, so default to 0
                harga_barang: item.price_perCarton || item.netPrice_perPcs || 0,
                createdBy: userId,
                updatedBy: userId,
              },
              update: {
                stok_c: { increment: item.qtyOrdered_carton || 0 },
                updatedBy: userId,
              },
            });

            const poDetail = await tx.purchaseOrderDetail.create({
              data: {
                purchaseOrderId: newPurchaseOrder.id,
                inventoryId: inventoryItem.id,
                plu: item.plu,
                nama_barang: item.productName,
                quantity: item.qtyOrdered_carton || 0,
                isi: 1,
                harga: item.price_perCarton || 0,
                harga_netto: item.netPrice_perPcs || 0,
                total_pembelian: item.totalLine_net || 0,
                createdBy: userId,
                updatedBy: userId,
              },
            });
            poDetails.push({
              plu: poDetail.plu,
              nama_barang: poDetail.nama_barang,
              harga: poDetail.harga,
              harga_netto: poDetail.harga_netto,
            });
          }

          await tx.fileUploaded.update({
            where: { id: file.id },
            data: {
              statusId: fileProcessedStatus.id,
              purchaseOrderId: newPurchaseOrder.id,
            },
          });

          await createAuditLog(
            'PurchaseOrder',
            newPurchaseOrder.id,
            'CREATE',
            userId,
            newPurchaseOrder
          );

          logger.info(`Successfully processed file ${file.id} and created PO ${newPurchaseOrder.id} with details.`);
        });

        try {
          const priceDifferenceNotifications = await NotificationService.checkPriceDifferenceAlerts(
            newPurchaseOrder.id,
            poDetails
          );
          
          if (priceDifferenceNotifications.length > 0) {
            logger.info(`Created ${priceDifferenceNotifications.length} price difference notifications for PO ${newPurchaseOrder.id}`);
          }
        } catch (notificationError) {
          logger.error(`Failed to create price difference notifications for PO ${newPurchaseOrder.id}:`, { error: notificationError });
        }
      } catch (error) {
        logger.error(`Failed to process file ${file.id}:`, { error });
        await prisma.fileUploaded.update({
          where: { id: file.id },
          data: { statusId: fileFailedStatus.id },
        });
      }
    }
  }

  static async getBulkUploadStatus(fileId: string) {
    const file = await prisma.fileUploaded.findUnique({
      where: { id: fileId },
      include: { status: true, purchaseOrder: { include: { purchaseOrderDetails: true } } },
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'FileUploaded',
        recordId: fileId,
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
      ...file,
      auditTrails,
    };
  }

  static async getAllBulkFiles(status?: string) {
    const whereClause: Prisma.FileUploadedWhereInput = {
      path: {
        contains: 'bulk',
      },
    };

    if (status) {
      whereClause.status = {
        status_code: status.toUpperCase(),
      };
    }

    return prisma.fileUploaded.findMany({
      where: whereClause,
      include: {
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
