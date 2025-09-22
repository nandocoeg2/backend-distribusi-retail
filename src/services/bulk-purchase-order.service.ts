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
          category: 'Bulk File Processing'
        },
        purchaseOrderId: null,
      },
    });

    if (pendingFiles.length === 0) {
      return;
    }

    const poPendingStatus = await prisma.status.findUnique({ 
      where: { 
        status_code_category: {
          status_code: 'PENDING PURCHASE ORDER',
          category: 'Purchase Order'
        }
      } 
    });
    const fileProcessingStatus = await prisma.status.findUnique({ 
      where: { 
        status_code_category: {
          status_code: 'PROCESSING BULK FILE',
          category: 'Bulk File Processing'
        }
      } 
    });
    const fileProcessedStatus = await prisma.status.findUnique({ 
      where: { 
        status_code_category: {
          status_code: 'PROCESSED BULK FILE',
          category: 'Bulk File Processing'
        }
      } 
    });
    const fileFailedStatus = await prisma.status.findUnique({ 
      where: { 
        status_code_category: {
          status_code: 'FAILED BULK FILE',
          category: 'Bulk File Processing'
        }
      } 
    });

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
            // Find or create default group customer
            let defaultGroupCustomer = await tx.groupCustomer.findFirst({
              where: { kode_group: 'DEFAULT' }
            });
            if (!defaultGroupCustomer) {
              defaultGroupCustomer = await tx.groupCustomer.create({
                data: {
                  kode_group: 'DEFAULT',
                  nama_group: 'Default Group',
                  alamat: 'Default Address',
                  createdBy: userId,
                  updatedBy: userId,
                },
              });
            }

            // Find or create default region
            let defaultRegion = await tx.region.findFirst({
              where: { kode_region: 'DEFAULT' }
            });
            if (!defaultRegion) {
              defaultRegion = await tx.region.create({
                data: {
                  kode_region: 'DEFAULT',
                  nama_region: 'Default Region',
                  createdBy: userId,
                  updatedBy: userId,
                },
              });
            }

            // This is a simplified customer creation. In a real-world scenario, you might need more data.
            customer = await tx.customer.create({
              data: {
                namaCustomer: customerName,
                kodeCustomer: `CUST-${customerName.toUpperCase().replace(/\s/g, '-')}`,
                alamatPengiriman: 'N/A',
                phoneNumber: 'N/A',
                groupCustomerId: defaultGroupCustomer.id,
                regionId: defaultRegion.id,
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
            // Generate PLU from product name if not provided
            const plu = item.plu || `PLU-${item.productName.toUpperCase().replace(/\s+/g, '-').substring(0, 10)}`;
            
            // Calculate price from totalLine_net and qtyOrdered_carton if available
            const harga_barang = item.price_perCarton || item.netPrice_perPcs || 
              (item.totalLine_net && item.qtyOrdered_carton ? item.totalLine_net / item.qtyOrdered_carton : 0);

            const inventoryItem = await tx.inventory.upsert({
              where: { plu: plu },
              create: {
                plu: plu,
                nama_barang: item.productName,
                stok_c: item.qtyOrdered_carton || 0,
                stok_q: 0, // NOTE: stok_q (pcs) is not available in bulk upload, so default to 0
                harga_barang: harga_barang,
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
                plu: plu,
                nama_barang: item.productName,
                quantity: item.qtyOrdered_carton || 0,
                isi: 1,
                harga: harga_barang,
                harga_netto: harga_barang,
                total_pembelian: item.totalLine_net || (item.qtyOrdered_carton * harga_barang),
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
