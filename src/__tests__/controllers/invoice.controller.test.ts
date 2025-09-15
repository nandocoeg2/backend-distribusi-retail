import { FastifyRequest, FastifyReply } from 'fastify';
import { InvoiceController } from '@/controllers/invoice.controller';
import { InvoiceService } from '@/services/invoice.service';
import { CreateInvoiceInput, UpdateInvoiceInput, SearchInvoiceInput } from '@/schemas/invoice.schema';

jest.mock('@/services/invoice.service');

describe('InvoiceController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123' }, // Mock authenticated user
    } as any;
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('should create an invoice and return 201', async () => {
      const createInput: CreateInvoiceInput = {
        no_invoice: 'INV-2024-001',
        deliver_to: 'Customer ABC',
        sub_total: 1000000,
        total_discount: 50000,
        total_price: 950000,
        ppn_percentage: 11,
        ppn_rupiah: 104500,
        grand_total: 1054500,
        type: 'PEMBAYARAN',
      };
      
      const invoice = {
        id: '1',
        ...createInput,
        createdBy: 'user123',
        updatedBy: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      request.body = createInput;
      (InvoiceService.createInvoice as jest.Mock).mockResolvedValue(invoice);

      await InvoiceController.createInvoice(request as any, reply as any);

      expect(InvoiceService.createInvoice).toHaveBeenCalledWith({
        ...createInput,
        createdBy: 'user123',
        updatedBy: 'user123',
      });
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(invoice);
    });

    it('should use system as fallback when user is not available', async () => {
      const createInput: CreateInvoiceInput = {
        no_invoice: 'INV-2024-001',
        deliver_to: 'Customer ABC',
        sub_total: 1000000,
        total_discount: 50000,
        total_price: 950000,
        ppn_percentage: 11,
        ppn_rupiah: 104500,
        grand_total: 1054500,
      };
      
      const invoice = {
        id: '1',
        ...createInput,
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      request.body = createInput;
      request.user = undefined; // No user available
      (InvoiceService.createInvoice as jest.Mock).mockResolvedValue(invoice);

      await InvoiceController.createInvoice(request as any, reply as any);

      expect(InvoiceService.createInvoice).toHaveBeenCalledWith({
        ...createInput,
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      });
    });
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const invoices = [
        { id: '1', no_invoice: 'INV-001' },
        { id: '2', no_invoice: 'INV-002' },
      ];
      const pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
      };
      
      request.query = { page: 1, limit: 10 };
      (InvoiceService.getAllInvoices as jest.Mock).mockResolvedValue({
        data: invoices,
        pagination,
      });

      await InvoiceController.getInvoices(request as any, reply as any);

      expect(InvoiceService.getAllInvoices).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith({
        data: invoices,
        pagination,
      });
    });
  });

  describe('getInvoice', () => {
    it('should return invoice by id', async () => {
      const invoice = { id: '1', no_invoice: 'INV-001' };
      request.params = { id: '1' };
      (InvoiceService.getInvoiceById as jest.Mock).mockResolvedValue(invoice);

      await InvoiceController.getInvoice(request as any, reply as any);

      expect(InvoiceService.getInvoiceById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(invoice);
    });

    it('should return 404 when invoice not found', async () => {
      request.params = { id: '999' };
      (InvoiceService.getInvoiceById as jest.Mock).mockResolvedValue(null);

      await InvoiceController.getInvoice(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Invoice not found' });
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice and return updated data', async () => {
      const updateData: UpdateInvoiceInput['body'] = {
        deliver_to: 'Customer Updated',
        sub_total: 1200000,
      };
      const updatedInvoice = { id: '1', ...updateData };
      
      request.params = { id: '1' };
      request.body = updateData;
      (InvoiceService.updateInvoice as jest.Mock).mockResolvedValue(updatedInvoice);

      await InvoiceController.updateInvoice(request as any, reply as any);

      expect(InvoiceService.updateInvoice).toHaveBeenCalledWith('1', {
        ...updateData,
        updatedBy: 'user123',
      });
      expect(reply.send).toHaveBeenCalledWith(updatedInvoice);
    });

    it('should return 404 when invoice not found', async () => {
      request.params = { id: '999' };
      request.body = { deliver_to: 'Updated' };
      (InvoiceService.updateInvoice as jest.Mock).mockResolvedValue(null);

      await InvoiceController.updateInvoice(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Invoice not found' });
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice and return 204', async () => {
      const deletedInvoice = { id: '1', no_invoice: 'INV-001' };
      request.params = { id: '1' };
      (InvoiceService.deleteInvoice as jest.Mock).mockResolvedValue(deletedInvoice);

      await InvoiceController.deleteInvoice(request as any, reply as any);

      expect(InvoiceService.deleteInvoice).toHaveBeenCalledWith('1');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalledWith();
    });

    it('should return 404 when invoice not found', async () => {
      request.params = { id: '999' };
      (InvoiceService.deleteInvoice as jest.Mock).mockResolvedValue(null);

      await InvoiceController.deleteInvoice(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Invoice not found' });
    });
  });

  describe('searchInvoices', () => {
    it('should search invoices with query parameters', async () => {
      const query: SearchInvoiceInput['query'] = {
        no_invoice: 'INV',
        deliver_to: 'Customer',
        page: 1,
        limit: 10,
      };
      const searchResult = {
        data: [{ id: '1', no_invoice: 'INV-001' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
      
      request.query = query;
      (InvoiceService.searchInvoices as jest.Mock).mockResolvedValue(searchResult);

      await InvoiceController.searchInvoices(request as any, reply as any);

      expect(InvoiceService.searchInvoices).toHaveBeenCalledWith(query);
      expect(reply.send).toHaveBeenCalledWith(searchResult);
    });
  });
});
