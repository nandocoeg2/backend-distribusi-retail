import { BulkPurchaseOrderService } from '@/services/bulk-purchase-order.service';
import { prisma } from '@/config/database';
import { convertFileToJson } from '@/services/conversion.service';
import logger from '@/config/logger';
import fs from 'fs/promises';
import { AppError } from '@/utils/app-error';

// Mock dependencies
jest.mock('@/config/database', () => ({
  prisma: {
    fileUploaded: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    status: {
      findUnique: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
    },
    inventory: {
      upsert: jest.fn(),
    },
    purchaseOrderDetail: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));
jest.mock('@/services/conversion.service', () => ({
  convertFileToJson: jest.fn(),
}));
jest.mock('@/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));
jest.mock('@/services/notification.service', () => ({
  NotificationService: {
    checkPriceDifferenceAlerts: jest.fn().mockResolvedValue([]),
  },
}));

describe('BulkPurchaseOrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPendingFiles', () => {
    const statuses = {
      poPending: { id: 'status_po_pending', status_code: 'PENDING PURCHASE ORDER' },
      pending: { id: 'status_pending', status_code: 'PENDING BULK FILE' },
      processing: { id: 'status_processing', status_code: 'PROCESSING BULK FILE' },
      processed: { id: 'status_processed', status_code: 'PROCESSED BULK FILE' },
      failed: { id: 'status_failed', status_code: 'FAILED BULK FILE' },
    };

    beforeEach(() => {
      (prisma.status.findUnique as jest.Mock).mockImplementation((options) => {
        if (options.where.status_code === 'PENDING PURCHASE ORDER') return statuses.poPending;
        if (options.where.status_code === 'PENDING BULK FILE') return statuses.pending;
        if (options.where.status_code === 'PROCESSING BULK FILE') return statuses.processing;
        if (options.where.status_code === 'PROCESSED BULK FILE') return statuses.processed;
        if (options.where.status_code === 'FAILED BULK FILE') return statuses.failed;
        return null;
      });
    });

    it('should do nothing if there are no pending files', async () => {
      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([]);

      await BulkPurchaseOrderService.processPendingFiles();

      expect(prisma.fileUploaded.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            status_code: {
              in: ['PENDING BULK FILE', 'FAILED BULK FILE'],
            },
          },
          purchaseOrderId: null,
        },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should log an error and abort if core statuses are not found', async () => {
      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([{ id: 'file1' }]);
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(null);

      await BulkPurchaseOrderService.processPendingFiles();

      expect(logger.error).toHaveBeenCalledWith('Core statuses (PENDING PURCHASE ORDER, PROCESSING BULK FILE, PROCESSED BULK FILE, FAILED BULK FILE) not found. Aborting.');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should successfully process a pending file and create a new customer', async () => {
      const pendingFile = {
        id: 'file1',
        path: 'path/to/file.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      const convertedJson = {
        order: { id: 'PO123', date: '01-JAN-25' },
        customers: { name: 'New Customer' },
        supplier: { code: 'SUP001' },
        items: [
          {
            plu: 'ITEM001',
            productName: 'Test Product',
            qtyOrdered_carton: 10,
            price_perCarton: 100,
            netPrice_perPcs: 90,
            totalLine_net: 900,
          },
        ],
      };

      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
      (convertFileToJson as jest.Mock).mockResolvedValue(convertedJson);

      const txMock = {
        customer: {
          findFirst: jest.fn().mockResolvedValue(null), // Customer not found
          create: jest.fn().mockResolvedValue({ id: 'new_cust_1', name: 'New Customer' }),
        },
        supplier: {
          findUnique: jest.fn().mockResolvedValue({ id: 'sup1', code: 'SUP001' }),
        },
        purchaseOrder: {
          create: jest.fn().mockResolvedValue({ id: 'po1' }),
        },
        inventory: {
          upsert: jest.fn().mockResolvedValue({ id: 'inv1' }),
        },
        purchaseOrderDetail: {
          create: jest.fn().mockResolvedValue({ id: 'detail1' }),
        },
        fileUploaded: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        await callback(txMock);
      });

      // Also mock the non-transaction update calls
      (prisma.fileUploaded.update as jest.Mock).mockResolvedValue({});

      await BulkPurchaseOrderService.processPendingFiles();

      expect(txMock.customer.findFirst).toHaveBeenCalledWith({ where: { name: { contains: 'New Customer', mode: 'insensitive' } } });
      expect(txMock.customer.create).toHaveBeenCalledWith({ 
        data: { 
          name: 'New Customer', 
          phoneNumber: 'N/A',
          createdBy: 'bulk-system',
          updatedBy: 'bulk-system',
        }
      });
      expect(txMock.inventory.upsert).toHaveBeenCalledTimes(1);
      expect(txMock.purchaseOrderDetail.create).toHaveBeenCalledTimes(1);
      expect(txMock.fileUploaded.update).toHaveBeenCalledWith({ where: { id: pendingFile.id }, data: { statusId: statuses.processed.id, purchaseOrderId: 'po1' } });
      expect(logger.info).toHaveBeenCalledWith(`Successfully processed file file1 and created PO po1 with details.`);
    });

    it('should handle processing failure and update file status to FAILED', async () => {
      const pendingFile = { id: 'file1', path: 'path/to/file.xlsx' };
      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Read error'));

      await BulkPurchaseOrderService.processPendingFiles();

      expect(logger.error).toHaveBeenCalledWith(`Failed to process file ${pendingFile.id}:`, { error: new Error('Read error') });
      expect(prisma.fileUploaded.update).toHaveBeenCalledWith({
        where: { id: pendingFile.id },
        data: { statusId: statuses.failed.id },
      });
    });

    it('should fail if PO number is missing from conversion result', async () => {
      const pendingFile = { id: 'file1', path: 'path/to/file.xlsx' };
      const convertedJson = { order: {}, customers: { name: 'Test Customer' }, items: [] };

      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
      (convertFileToJson as jest.Mock).mockResolvedValue(convertedJson);

      await BulkPurchaseOrderService.processPendingFiles();

      expect(logger.error).toHaveBeenCalledWith(`Failed to process file ${pendingFile.id}:`, { error: new Error('Conversion result missing PO number.') });
      expect(prisma.fileUploaded.update).toHaveBeenCalledWith({
        where: { id: pendingFile.id },
        data: { statusId: statuses.failed.id },
      });
    });

    it('should fail if customer name is missing from conversion result', async () => {
      const pendingFile = { id: 'file1', path: 'path/to/file.xlsx' };
      const convertedJson = { order: { id: 'PO123' }, customers: {}, items: [] };

      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
      (convertFileToJson as jest.Mock).mockResolvedValue(convertedJson);

      await BulkPurchaseOrderService.processPendingFiles();

      expect(logger.error).toHaveBeenCalledWith(`Failed to process file ${pendingFile.id}:`, { error: new Error('Customer name missing from file.') });
      expect(prisma.fileUploaded.update).toHaveBeenCalledWith({
        where: { id: pendingFile.id },
        data: { statusId: statuses.failed.id },
      });
    });

    it('should fail if items array is missing from conversion result', async () => {
      const pendingFile = { id: 'file1', path: 'path/to/file.xlsx' };
      const convertedJson = { order: { id: 'PO123' }, customers: { name: 'Test Customer' } }; // No items array

      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
      (convertFileToJson as jest.Mock).mockResolvedValue(convertedJson);

      await BulkPurchaseOrderService.processPendingFiles();

      expect(logger.error).toHaveBeenCalledWith(`Failed to process file ${pendingFile.id}:`, { error: new Error('Items array is missing or invalid in the conversion result.') });
      expect(prisma.fileUploaded.update).toHaveBeenCalledWith({
        where: { id: pendingFile.id },
        data: { statusId: statuses.failed.id },
      });
    });

    it('should use fallback values for missing optional item fields', async () => {
      const pendingFile = { id: 'file1', path: 'path/to/file.xlsx', mimetype: 'mimetype' };
      const convertedJson = {
        order: { id: 'PO123', date: '01-JAN-25' },
        customers: { name: 'Test Customer' },
        supplier: { code: 'SUP001' },
        items: [{ plu: 'ITEM001', productName: 'Test Product' }], // Missing optional fields
      };

      (prisma.fileUploaded.findMany as jest.Mock).mockResolvedValue([pendingFile]);
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from(''));
      (convertFileToJson as jest.Mock).mockResolvedValue(convertedJson);

      const txMock = {
        customer: { findFirst: jest.fn().mockResolvedValue({ id: 'cust1' }), create: jest.fn() },
        supplier: { findUnique: jest.fn().mockResolvedValue({ id: 'sup1' }) },
        purchaseOrder: { create: jest.fn().mockResolvedValue({ id: 'po1' }) },
        inventory: { upsert: jest.fn().mockResolvedValue({ id: 'inv1' }) },
        purchaseOrderDetail: { create: jest.fn() },
        fileUploaded: { update: jest.fn() },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        await callback(txMock);
      });

      await BulkPurchaseOrderService.processPendingFiles();

      expect(txMock.inventory.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ stok_barang: 0, harga_barang: 0 }),
        update: { stok_barang: { increment: 0 } },
      }));

      expect(txMock.purchaseOrderDetail.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ quantity: 0, harga: 0, harga_netto: 0, total_pembelian: 0 }),
      }));
    });
  });

  describe('getBulkUploadStatus', () => {
    it('should return file status if file is found', async () => {
      const fileId = 'file123';
      const fileData = { id: fileId, status: { status_code: 'PROCESSED BULK FILE' } };
      (prisma.fileUploaded.findUnique as jest.Mock).mockResolvedValue(fileData);

      const result = await BulkPurchaseOrderService.getBulkUploadStatus(fileId);

      expect(prisma.fileUploaded.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
        include: { status: true, purchaseOrder: { include: { purchaseOrderDetails: true } } },
      });
      expect(result).toEqual(fileData);
    });

    it('should throw AppError if file is not found', async () => {
      const fileId = 'nonexistentfile';
      (prisma.fileUploaded.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(BulkPurchaseOrderService.getBulkUploadStatus(fileId)).rejects.toThrow(new AppError('File not found', 404));
    });
  });
});

