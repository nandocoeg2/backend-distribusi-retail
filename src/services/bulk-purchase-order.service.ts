import { prisma } from '@/config/database';
import { convertFileToJson } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';
import logger from '@/config/logger';
import fs from 'fs/promises';
import { POType, Supplier, Prisma } from '@prisma/client';

export class BulkPurchaseOrderService {
  static async processPendingFiles() {
    const pendingFiles = await prisma.fileUploaded.findMany({
      where: {
        status: {
          status_code: 'PENDING BULK FILE',
        },
        purchaseOrderId: null,
      },
    });

    if (pendingFiles.length === 0) {
      return;
    }

    const poPendingStatus = await prisma.status.findUnique({ where: { status_code: 'PENDING' } });
    const fileProcessingStatus = await prisma.status.findUnique({ where: { status_code: 'PROCESSING BULK FILE' } });
    const fileProcessedStatus = await prisma.status.findUnique({ where: { status_code: 'PROCESSED BULK FILE' } });
    const fileFailedStatus = await prisma.status.findUnique({ where: { status_code: 'FAILED BULK FILE' } });

    if (!poPendingStatus || !fileProcessingStatus || !fileProcessedStatus || !fileFailedStatus) {
      logger.error('Core statuses (PENDING, PROCESSING BULK FILE, PROCESSED BULK FILE, FAILED BULK FILE) not found. Aborting.');
      return;
    }

    for (const file of pendingFiles) {
      try {
        // --- Lock the file by setting status to PROCESSING ---
        await prisma.fileUploaded.update({
          where: { id: file.id },
          data: { statusId: fileProcessingStatus.id },
        });
        logger.info(`Locked file ${file.id} for processing.`);
        // --- Perform heavy operations outside the transaction ---
        const fileBuffer = await fs.readFile(file.path);
        const jsonResult: any = await convertFileToJson(
          fileBuffer,
          file.mimetype,
          'extract purchase order details as json'
        );

        // --- Start transaction for database operations only ---
        await prisma.$transaction(async (tx) => {
          const poNumber = jsonResult.order?.id;
          if (!poNumber) throw new Error('Conversion result missing PO number.');

          const customerName = jsonResult.customers?.name;
          if (!customerName) throw new Error('Customer name missing from file.');

          let customer = await tx.customer.findFirst({ where: { name: { contains: customerName, mode: 'insensitive' } } });
          if (!customer) {
            customer = await tx.customer.create({ data: { name: customerName, phoneNumber: 'N/A' } });
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

          const newPurchaseOrder = await tx.purchaseOrder.create({
            data: {
              po_number: poNumber,
              customerId: customer.id,
              supplierId: supplier?.id,
              total_items: jsonResult.items?.length || 0,
              tanggal_order: parsedOrderDate,
              po_type: POType.BULK,
              statusId: poPendingStatus.id,
            },
          });

          if (!jsonResult.items || !Array.isArray(jsonResult.items)) {
            throw new Error('Items array is missing or invalid in the conversion result.');
          }

          for (const item of jsonResult.items) {
            const inventoryItem = await tx.inventory.upsert({
              where: { kode_barang: item.plu },
              create: {
                kode_barang: item.plu,
                nama_barang: item.productName,
                stok_barang: item.qtyOrdered_carton || 0,
                harga_barang: item.price_perCarton || item.netPrice_perPcs || 0,
              },
              update: {
                stok_barang: { increment: item.qtyOrdered_carton || 0 },
              },
            });

            await tx.purchaseOrderDetail.create({
              data: {
                purchaseOrderId: newPurchaseOrder.id,
                inventoryId: inventoryItem.id,
                kode_barang: item.plu,
                nama_barang: item.productName,
                quantity: item.qtyOrdered_carton || 0,
                isi: 1, // Defaulting to 1 as it's not in the source file
                harga: item.price_perCarton || 0,
                harga_netto: item.netPrice_perPcs || 0,
                total_pembelian: item.totalLine_net || 0,
              },
            });
          }

          await tx.fileUploaded.update({
            where: { id: file.id },
            data: {
              statusId: fileProcessedStatus.id,
              purchaseOrderId: newPurchaseOrder.id,
            },
          });

          logger.info(`Successfully processed file ${file.id} and created PO ${newPurchaseOrder.id} with details.`);
        });
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

    return file;
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
