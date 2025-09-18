import { FastifyRequest, FastifyReply } from 'fastify';
import { SuratJalanController } from '@/controllers/surat-jalan.controller';
import { SuratJalanService } from '@/services/surat-jalan.service';
import { ResponseUtil } from '@/utils/response.util';
import { AppError } from '@/utils/app-error';

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
      const createInput = { no_surat_jalan: 'SJ-001' };
      const createdSuratJalan = { id: '1', ...createInput };
      request.body = createInput;
      (SuratJalanService.createSuratJalan as jest.Mock).mockResolvedValue(createdSuratJalan);

      await SuratJalanController.createSuratJalan(request as any, reply as any);

      expect(SuratJalanService.createSuratJalan).toHaveBeenCalledWith(createInput, 'user123');
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(createdSuratJalan));
    });

    it('should handle service errors', async () => {
      const createInput = { no_surat_jalan: 'SJ-001' };
      request.body = createInput;
      const error = new AppError('Database error', 500);
      (SuratJalanService.createSuratJalan as jest.Mock).mockRejectedValue(error);

      await SuratJalanController.createSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Database error'));
    });
  });

  describe('getAllSuratJalan', () => {
    it('should return paginated surat jalan', async () => {
      const suratJalan = [{ id: '1', no_surat_jalan: 'SJ-001' }];
      const pagination = { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 };
      const result = { data: suratJalan, pagination };
      (SuratJalanService.getAllSuratJalan as jest.Mock).mockResolvedValue(result);

      await SuratJalanController.getAllSuratJalan(request as any, reply as any);

      expect(SuratJalanService.getAllSuratJalan).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(result));
    });
  });

  describe('getSuratJalanById', () => {
    it('should return surat jalan by id', async () => {
      const suratJalan = { id: '1', no_surat_jalan: 'SJ-001' };
      request.params = { id: '1' };
      (SuratJalanService.getSuratJalanById as jest.Mock).mockResolvedValue(suratJalan);

      await SuratJalanController.getSuratJalanById(request as any, reply as any);

      expect(SuratJalanService.getSuratJalanById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(suratJalan));
    });

    it('should return 404 when surat jalan not found', async () => {
      request.params = { id: '999' };
      const error = new AppError('Surat jalan not found', 404);
      (SuratJalanService.getSuratJalanById as jest.Mock).mockRejectedValue(error);

      await SuratJalanController.getSuratJalanById(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Surat jalan not found'));
    });
  });

  describe('updateSuratJalan', () => {
    it('should update surat jalan and return updated data', async () => {
      const updateData = { deliver_to: 'Updated Customer' };
      const updatedSuratJalan = { id: '1', ...updateData };
      request.params = { id: '1' };
      request.body = updateData;
      (SuratJalanService.updateSuratJalan as jest.Mock).mockResolvedValue(updatedSuratJalan);

      await SuratJalanController.updateSuratJalan(request as any, reply as any);

      expect(SuratJalanService.updateSuratJalan).toHaveBeenCalledWith('1', updateData, 'user123');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(updatedSuratJalan));
    });

    it('should return 404 when surat jalan not found', async () => {
      const updateData = { deliver_to: 'Updated' };
      request.params = { id: '999' };
      request.body = updateData;
      const error = new AppError('Surat jalan not found', 404);
      (SuratJalanService.updateSuratJalan as jest.Mock).mockRejectedValue(error);

      await SuratJalanController.updateSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Surat jalan not found'));
    });
  });

  describe('deleteSuratJalan', () => {
    it('should delete surat jalan and return 204', async () => {
      request.params = { id: '1' };
      (SuratJalanService.deleteSuratJalan as jest.Mock).mockResolvedValue({} as any);

      await SuratJalanController.deleteSuratJalan(request as any, reply as any);

      expect(SuratJalanService.deleteSuratJalan).toHaveBeenCalledWith('1', 'user123');
      expect(reply.code).toHaveBeenCalledWith(204);
    });

    it('should return 404 when surat jalan not found', async () => {
      request.params = { id: '999' };
      const error = new AppError('Surat jalan not found', 404);
      (SuratJalanService.deleteSuratJalan as jest.Mock).mockRejectedValue(error);

      await SuratJalanController.deleteSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Surat jalan not found'));
    });
  });

  describe('searchSuratJalan', () => {
    it('should search surat jalan with query parameters', async () => {
      const query = { no_surat_jalan: 'SJ-001' };
      const searchResult = { data: [{ id: '1', no_surat_jalan: 'SJ-001' }], pagination: {} };
      request.query = query;
      (SuratJalanService.searchSuratJalan as jest.Mock).mockResolvedValue(searchResult);

      await SuratJalanController.searchSuratJalan(request as any, reply as any);

      expect(SuratJalanService.searchSuratJalan).toHaveBeenCalledWith(query);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(searchResult));
    });

    it('should handle search errors', async () => {
      request.query = {};
      const error = new Error('Search error');
      (SuratJalanService.searchSuratJalan as jest.Mock).mockRejectedValue(error);

      await SuratJalanController.searchSuratJalan(request as any, reply as any);

      expect(reply.code).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Failed to search surat jalan'));
    });
  });
});
