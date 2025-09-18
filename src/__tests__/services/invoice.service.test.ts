import { InvoiceService } from '@/services/invoice.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

jest.mock('@/services/audit.service', () => ({
    createAuditLog: jest.fn(),
}));

jest.mock('@/config/database', () => ({
  prisma: {
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invoiceDetail: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    auditTrail: {
        findMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => callback(prisma)),
  },
}));

describe('InvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const createInput = {
        no_invoice: 'INV-2024-001',
        deliver_to: 'Customer ABC',
        sub_total: 1000000,
        total_discount: 50000,
        total_price: 950000,
        ppn_percentage: 11,
        ppn_rupiah: 104500,
        grand_total: 1054500,
        type: 'PEMBAYARAN' as const,
      };

      const expectedInvoice = {
        id: '1',
        ...createInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      };

      (prisma.invoice.create as jest.Mock).mockResolvedValue(expectedInvoice);

      const result = await InvoiceService.createInvoice(createInput, 'user123');

      expect(prisma.invoice.create).toHaveBeenCalled();
      expect(result).toEqual(expectedInvoice);
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice by id', async () => {
      const invoice = { id: '1', no_invoice: 'INV-001' };
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(invoice);
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue([]);

      const result = await InvoiceService.getInvoiceById('1');

      expect(result).toEqual({ ...invoice, auditTrails: [] });
    });

    it('should throw error when invoice not found', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(InvoiceService.getInvoiceById('999')).rejects.toThrow(
        new AppError('Invoice not found', 404)
      );
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice successfully', async () => {
      const updateData = {
        deliver_to: 'Updated Customer',
        sub_total: 1200000,
      };
      const existingInvoice = { id: '1', no_invoice: 'INV-001' };
      const updatedInvoice = { id: '1', ...updateData };

      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(existingInvoice);
      (prisma.invoice.update as jest.Mock).mockResolvedValue(updatedInvoice);

      const result = await InvoiceService.updateInvoice('1', updateData, 'user123');

      expect(prisma.invoice.update).toHaveBeenCalled();
      expect(result).toEqual(updatedInvoice);
    });

    it('should throw error when invoice not found', async () => {
      const updateData = { deliver_to: 'Updated Customer' };
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(InvoiceService.updateInvoice('999', updateData, 'user123')).rejects.toThrow(
        new AppError('Invoice not found', 404)
      );
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const deletedInvoice = { id: '1', no_invoice: 'INV-001' };
      const existingInvoice = { id: '1', no_invoice: 'INV-001', invoiceDetails: [] };
      
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(existingInvoice);
      (prisma.invoice.delete as jest.Mock).mockResolvedValue(deletedInvoice);

      const result = await InvoiceService.deleteInvoice('1', 'user123');

      expect(result).toEqual(deletedInvoice);
    });

    it('should throw error when invoice not found', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(InvoiceService.deleteInvoice('999', 'user123')).rejects.toThrow('Invoice not found');
    });
  });
});
