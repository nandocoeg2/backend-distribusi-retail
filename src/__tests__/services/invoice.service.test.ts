import { InvoiceService } from '@/services/invoice.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

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
        createdBy: 'system',
        updatedBy: 'system',
      };

      (prisma.invoice.create as jest.Mock).mockResolvedValue(expectedInvoice);

      const result = await InvoiceService.createInvoice(createInput);

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          no_invoice: 'INV-2024-001',
          deliver_to: 'Customer ABC',
          sub_total: 1000000,
        }),
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
        },
      });
      expect(result).toEqual(expectedInvoice);
    });

    it('should handle duplicate invoice number error', async () => {
      const createInput = {
        no_invoice: 'INV-2024-001',
        deliver_to: 'Customer ABC',
        sub_total: 1000000,
        total_discount: 50000,
        total_price: 950000,
        ppn_percentage: 11,
        ppn_rupiah: 104500,
        grand_total: 1054500,
      };

      const error = new Error('Duplicate entry');
      (error as any).code = 'P2002';
      (error as any).meta = { target: ['no_invoice'] };
      (prisma.invoice.create as jest.Mock).mockRejectedValue(error);

      await expect(InvoiceService.createInvoice(createInput)).rejects.toThrow(
        new AppError('Invoice with this number already exists', 409)
      );
    });

    it('should create invoice with invoice details', async () => {
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
        invoiceDetails: [
          {
            nama_barang: 'Product A',
            PLU: 'PLU001',
            quantity: 10,
            satuan: 'pcs',
            harga: 100000,
            total: 1000000,
            discount_percentage: 5,
            discount_rupiah: 50000,
            PPN_pecentage: 11,
            ppn_rupiah: 104500,
          },
        ],
      };

      const expectedInvoice = {
        id: '1',
        ...createInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
      };

      (prisma.invoice.create as jest.Mock).mockResolvedValue(expectedInvoice);

      const result = await InvoiceService.createInvoice(createInput);

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          invoiceDetails: {
            create: expect.arrayContaining([
              expect.objectContaining({
                nama_barang: 'Product A',
                PLU: 'PLU001',
                quantity: 10,
              }),
            ]),
          },
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(expectedInvoice);
    });
  });

  describe('getAllInvoices', () => {
    it('should return paginated invoices', async () => {
      const invoices = [
        { id: '1', no_invoice: 'INV-001' },
        { id: '2', no_invoice: 'INV-002' },
      ];

      (prisma.invoice.findMany as jest.Mock).mockResolvedValue(invoices);
      (prisma.invoice.count as jest.Mock).mockResolvedValue(2);

      const result = await InvoiceService.getAllInvoices(1, 10);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: invoices,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice by id', async () => {
      const invoice = { id: '1', no_invoice: 'INV-001' };
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(invoice);

      const result = await InvoiceService.getInvoiceById('1');

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: {
            include: {
              customer: true,
              supplier: true,
            },
          },
          suratJalan: true,
        },
      });
      expect(result).toEqual(invoice);
    });

    it('should return null when invoice not found', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await InvoiceService.getInvoiceById('999');

      expect(result).toBeNull();
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

      const result = await InvoiceService.updateInvoice('1', updateData);

      expect(prisma.invoice.update).toHaveBeenCalled();
      expect(result).toEqual(updatedInvoice);
    });

    it('should throw error when invoice not found', async () => {
      const updateData = { deliver_to: 'Updated Customer' };
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(InvoiceService.updateInvoice('999', updateData)).rejects.toThrow(
        new AppError('Invoice not found', 404)
      );
    });

    it('should update invoice with invoice details', async () => {
      const updateData = {
        deliver_to: 'Updated Customer',
        invoiceDetails: [
          {
            nama_barang: 'Updated Product',
            PLU: 'PLU002',
            quantity: 20,
            satuan: 'pcs',
            harga: 150000,
            total: 3000000,
            discount_percentage: 10,
            discount_rupiah: 300000,
            PPN_pecentage: 11,
            ppn_rupiah: 297000,
          },
        ],
      };
      const existingInvoice = { id: '1', no_invoice: 'INV-001' };
      const updatedInvoice = { id: '1', ...updateData };

      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(existingInvoice);
      (prisma.invoice.update as jest.Mock).mockResolvedValue(updatedInvoice);

      const result = await InvoiceService.updateInvoice('1', updateData);

      expect(prisma.invoiceDetail.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            invoiceId: '1',
            nama_barang: 'Updated Product',
            PLU: 'PLU002',
            quantity: 20,
          }),
        ]),
      });
      expect(result).toEqual(updatedInvoice);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const deletedInvoice = { id: '1', no_invoice: 'INV-001' };
      const existingInvoice = { id: '1', no_invoice: 'INV-001', invoiceDetails: [] };
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          invoice: {
            findUnique: jest.fn().mockResolvedValue(existingInvoice),
            delete: jest.fn().mockResolvedValue(deletedInvoice),
          },
          invoiceDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
        });
      });

      const result = await InvoiceService.deleteInvoice('1');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(deletedInvoice);
    });

    it('should throw error when invoice not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          invoice: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(InvoiceService.deleteInvoice('999')).rejects.toThrow('Invoice not found');
    });
  });

  describe('searchInvoices', () => {
    it('should search invoices with no filters', async () => {
      const invoices = [
        { id: '1', no_invoice: 'INV-001' },
        { id: '2', no_invoice: 'INV-002' },
      ];

      (prisma.invoice.findMany as jest.Mock).mockResolvedValue(invoices);
      (prisma.invoice.count as jest.Mock).mockResolvedValue(2);

      const result = await InvoiceService.searchInvoices({ page: 1, limit: 10 });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { AND: undefined },
        skip: 0,
        take: 10,
        include: {
          invoiceDetails: true,
          statusPembayaran: true,
          purchaseOrder: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: invoices,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        },
      });
    });

    it('should search invoices with filters', async () => {
      const query = {
        no_invoice: 'INV-001',
        deliver_to: 'Customer ABC',
        type: 'PEMBAYARAN' as const,
        statusPembayaranId: 'status1',
        purchaseOrderId: 'po1',
        tanggal_start: '2024-01-01',
        tanggal_end: '2024-12-31',
        page: 1,
        limit: 10,
      };
      const invoices = [{ id: '1', no_invoice: 'INV-001' }];

      (prisma.invoice.findMany as jest.Mock).mockResolvedValue(invoices);
      (prisma.invoice.count as jest.Mock).mockResolvedValue(1);

      const result = await InvoiceService.searchInvoices(query);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { no_invoice: { contains: 'INV-001', mode: 'insensitive' } },
            { deliver_to: { contains: 'Customer ABC', mode: 'insensitive' } },
            { type: 'PEMBAYARAN' },
            { statusPembayaranId: 'status1' },
            { purchaseOrderId: 'po1' },
            {
              tanggal: {
                gte: new Date('2024-01-01'),
                lte: new Date('2024-12-31'),
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(invoices);
    });
  });
});
