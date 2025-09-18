import { FastifyRequest, FastifyReply } from 'fastify';
import { HistoryPengirimanController } from '@/controllers/history-pengiriman.controller';
import { HistoryPengirimanService } from '@/services/history-pengiriman.service';
import { ResponseUtil } from '@/utils/response.util';

jest.mock('@/services/history-pengiriman.service');

describe('HistoryPengirimanController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      params: {},
    };
    reply = {
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all history pengiriman', async () => {
      const mockData = [{ id: '1' }];
      (HistoryPengirimanService.getAll as jest.Mock).mockResolvedValue(mockData);

      await HistoryPengirimanController.getAll(request as FastifyRequest, reply as FastifyReply);

      expect(HistoryPengirimanService.getAll).toHaveBeenCalled();
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockData));
    });
  });

  describe('getBySuratJalanId', () => {
    it('should get history pengiriman by surat jalan id', async () => {
      const mockData = [{ id: '1' }];
      request.params = { suratJalanId: 'sj-123' };
      (HistoryPengirimanService.getBySuratJalanId as jest.Mock).mockResolvedValue(mockData);

      await HistoryPengirimanController.getBySuratJalanId(request as any, reply as FastifyReply);

      expect(HistoryPengirimanService.getBySuratJalanId).toHaveBeenCalledWith('sj-123');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockData));
    });
  });

  describe('getByTanggalKirim', () => {
    it('should get history pengiriman by tanggal kirim', async () => {
        const testDate = new Date('2025-09-07');
        const mockData = [{ id: '1', tanggal_kirim: testDate }];
        request.params = { tanggalKirim: testDate.toISOString() };
        (HistoryPengirimanService.getByTanggalKirim as jest.Mock).mockResolvedValue(mockData);

        await HistoryPengirimanController.getByTanggalKirim(request as any, reply as FastifyReply);

        expect(HistoryPengirimanService.getByTanggalKirim).toHaveBeenCalledWith(testDate);
        expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockData));
    });
  });

  describe('getByStatusCode', () => {
    it('should get history pengiriman by status code', async () => {
        const mockData = [{ id: '1' }];
        request.params = { statusCode: 'status-123' };
        (HistoryPengirimanService.getByStatusCode as jest.Mock).mockResolvedValue(mockData);

        await HistoryPengirimanController.getByStatusCode(request as any, reply as FastifyReply);

        expect(HistoryPengirimanService.getByStatusCode).toHaveBeenCalledWith('status-123');
        expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockData));
    });
  });
});
