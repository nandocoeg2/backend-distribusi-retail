import { FastifyRequest, FastifyReply } from 'fastify';
import { SuratJalanController } from '@/controllers/surat-jalan.controller';
import { SuratJalanService } from '@/services/surat-jalan.service';
import { CreateSuratJalanInput, UpdateSuratJalanInput, SearchSuratJalanInput } from '@/schemas/surat-jalan.schema';

jest.mock('@/services/surat-jalan.service');

describe('SuratJalanController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123' },
    } as any;
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSuratJalan', () => {
    it('should create a surat jalan and return 201', async () => {
      const createInput: CreateSuratJalanInput = {
        no_surat_jalan: 'SJ-2024-001',
        deliver_to: 'Customer ABC',
        PIC: 'John Doe',
        alamat_tujuan: 'Jl. Example No. 123, Jakarta',
        invoiceId: 'inv123',
        suratJalanDetails: [
          {
            no_box: 'BOX-001',
            total_quantity_in_box: 100,
            isi_box: 10,
            sisa: 0,
            total_box: 10,
            items: [
              {
                nama_barang: 'Product A',
                PLU: 'PLU001',
                quantity: 50,
                satuan: 'pcs',
                total_box: 5,
                keterangan: 'Fragile',
              },
            ],
          },
        ],
      };
      
      const suratJalan = {
        id: '1',
        ...createInput,
        is_printed: false,
        print_counter: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      request.body = createInput;
      (SuratJalanService.createSuratJalan as jest.Mock).mockResolvedValue(suratJalan);

      await SuratJalanController.createSuratJalan(request as any, reply as any);

      expect(SuratJalanService.createSuratJalan).toHaveBeenCalledWith(createInput);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: suratJalan,
        message: 'Surat jalan created successfully',
      });
    });

    it('should handle service errors', async () => {
      const createInput: CreateSuratJalanInput = {
        no_surat_jalan: 'SJ-2024-001',
        deliver_to: 'Customer ABC',
        PIC: 'John Doe',
        alamat_tujuan: 'Jl. Example No. 123, Jakarta',
        suratJalanDetails: [],
      };
      
      request.body = createInput;
      const error = new Error('Database error');
      (SuratJalanService.createSuratJalan as jest.Mock).mockRejectedValue(error);

      await expect(
        SuratJalanController.createSuratJalan(request as any, reply as any)
      ).rejects.toThrow('Failed to create surat jalan');
    });
  });

  describe('getAllSuratJalan', () => {
    it('should return paginated surat jalan', async () => {
      const suratJalan = [
        { id: '1', no_surat_jalan: 'SJ-001' },
        { id: '2', no_surat_jalan: 'SJ-002' },
      ];
      const pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
      };
      
      request.query = { page: '1', limit: '10' };
      (SuratJalanService.getAllSuratJalan as jest.Mock).mockResolvedValue({
        data: suratJalan,
        pagination,
      });

      await SuratJalanController.getAllSuratJalan(request as any, reply as any);

      expect(SuratJalanService.getAllSuratJalan).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: suratJalan,
        pagination,
        message: 'Surat jalan retrieved successfully',
      });
    });

    it('should use default pagination values', async () => {
      const suratJalan = [];
      const pagination = {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      };
      
      request.query = {};
      (SuratJalanService.getAllSuratJalan as jest.Mock).mockResolvedValue({
        data: suratJalan,
        pagination,
      });

      await SuratJalanController.getAllSuratJalan(request as any, reply as any);

      expect(SuratJalanService.getAllSuratJalan).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getSuratJalanById', () => {
    it('should return surat jalan by id', async () => {
      const suratJalan = { id: '1', no_surat_jalan: 'SJ-001' };
      request.params = { id: '1' };
      (SuratJalanService.getSuratJalanById as jest.Mock).mockResolvedValue(suratJalan);

      await SuratJalanController.getSuratJalanById(request as any, reply as any);

      expect(SuratJalanService.getSuratJalanById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: suratJalan,
        message: 'Surat jalan retrieved successfully',
      });
    });

    it('should return 404 when surat jalan not found', async () => {
      request.params = { id: '999' };
      (SuratJalanService.getSuratJalanById as jest.Mock).mockResolvedValue(null);

      await SuratJalanController.getSuratJalanById(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Surat jalan not found' });
    });
  });

  describe('updateSuratJalan', () => {
    it('should update surat jalan and return updated data', async () => {
      const updateData: UpdateSuratJalanInput['body'] = {
        deliver_to: 'Updated Customer',
        PIC: 'Jane Doe',
      };
      const updatedSuratJalan = { id: '1', ...updateData };
      
      request.params = { id: '1' };
      request.body = updateData;
      (SuratJalanService.updateSuratJalan as jest.Mock).mockResolvedValue(updatedSuratJalan);

      await SuratJalanController.updateSuratJalan(request as any, reply as any);

      expect(SuratJalanService.updateSuratJalan).toHaveBeenCalledWith('1', updateData);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: updatedSuratJalan,
        message: 'Surat jalan updated successfully',
      });
    });

    it('should return 404 when surat jalan not found', async () => {
      request.params = { id: '999' };
      request.body = { deliver_to: 'Updated' };
      (SuratJalanService.updateSuratJalan as jest.Mock).mockResolvedValue(null);

      await SuratJalanController.updateSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Surat jalan not found' });
    });
  });

  describe('deleteSuratJalan', () => {
    it('should delete surat jalan and return success', async () => {
      const deletedSuratJalan = { id: '1', no_surat_jalan: 'SJ-001' };
      request.params = { id: '1' };
      (SuratJalanService.deleteSuratJalan as jest.Mock).mockResolvedValue(deletedSuratJalan);

      await SuratJalanController.deleteSuratJalan(request as any, reply as any);

      expect(SuratJalanService.deleteSuratJalan).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: deletedSuratJalan,
        message: 'Surat jalan deleted successfully',
      });
    });

    it('should return 404 when surat jalan not found', async () => {
      request.params = { id: '999' };
      (SuratJalanService.deleteSuratJalan as jest.Mock).mockResolvedValue(null);

      await SuratJalanController.deleteSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Surat jalan not found' });
    });
  });

  describe('searchSuratJalan', () => {
    it('should search surat jalan with query parameters', async () => {
      const query: SearchSuratJalanInput['query'] = {
        no_surat_jalan: 'SJ',
        deliver_to: 'Customer',
        page: 1,
        limit: 10,
      };
      const searchResult = {
        data: [{ id: '1', no_surat_jalan: 'SJ-001' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
      
      request.query = query;
      (SuratJalanService.searchSuratJalan as jest.Mock).mockResolvedValue(searchResult);

      await SuratJalanController.searchSuratJalan(request as any, reply as any);

      expect(SuratJalanService.searchSuratJalan).toHaveBeenCalledWith(query);
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        data: searchResult.data,
        pagination: searchResult.pagination,
        message: 'Surat jalan search completed successfully',
      });
    });

    it('should handle search errors', async () => {
      request.query = {};
      const error = new Error('Search error');
      (SuratJalanService.searchSuratJalan as jest.Mock).mockRejectedValue(error);

      await expect(
        SuratJalanController.searchSuratJalan(request as any, reply as any)
      ).rejects.toThrow('Failed to search surat jalan');
    });
  });
});
