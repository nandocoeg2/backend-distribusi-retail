import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllHistoryPengirimanHandler,
  getHistoryPengirimanBySuratJalanIdHandler,
  getHistoryPengirimanByTanggalKirimHandler,
  getHistoryPengirimanByStatusCodeHandler,
} from '../../controllers/history-pengiriman.controller';
import * as historyPengirimanService from '../../services/history-pengiriman.service';

// Mock the service
jest.mock('../../services/history-pengiriman.service');

describe('History Pengiriman Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {};
    reply = {
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all history pengiriman', async () => {
    const mockData = [{ id: '1', notes: 'Test' }];
    (historyPengirimanService.getAllHistoryPengiriman as jest.Mock).mockResolvedValue(mockData);

    await getAllHistoryPengirimanHandler(request as FastifyRequest, reply as FastifyReply);

    expect(historyPengirimanService.getAllHistoryPengiriman).toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalledWith(mockData);
  });

  it('should get history pengiriman by surat jalan id', async () => {
    const mockData = [{ id: '1', surat_jalan_id: 'sj-123' }];
    request.params = { suratJalanId: 'sj-123' };
    (historyPengirimanService.getHistoryPengirimanBySuratJalanId as jest.Mock).mockResolvedValue(mockData);

    await getHistoryPengirimanBySuratJalanIdHandler(
      request as FastifyRequest<{ Params: { suratJalanId: string } }>,
      reply as FastifyReply
    );

    expect(historyPengirimanService.getHistoryPengirimanBySuratJalanId).toHaveBeenCalledWith('sj-123');
    expect(reply.send).toHaveBeenCalledWith(mockData);
  });

  it('should get history pengiriman by tanggal kirim', async () => {
    const testDate = '2025-09-07';
    const mockData = [{ id: '1', tanggal_kirim: new Date(testDate) }];
    request.params = { tanggalKirim: testDate };
    (historyPengirimanService.getHistoryPengirimanByTanggalKirim as jest.Mock).mockResolvedValue(mockData);

    await getHistoryPengirimanByTanggalKirimHandler(
      request as FastifyRequest<{ Params: { tanggalKirim: string } }>,
      reply as FastifyReply
    );

    expect(historyPengirimanService.getHistoryPengirimanByTanggalKirim).toHaveBeenCalledWith(new Date(testDate));
    expect(reply.send).toHaveBeenCalledWith(mockData);
  });

  it('should get history pengiriman by status code', async () => {
    const mockData = [{ id: '1', status_id: 'status-123' }];
    request.params = { statusCode: 'status-123' };
    (historyPengirimanService.getHistoryPengirimanByStatusCode as jest.Mock).mockResolvedValue(mockData);

    await getHistoryPengirimanByStatusCodeHandler(
      request as FastifyRequest<{ Params: { statusCode: string } }>,
      reply as FastifyReply
    );

    expect(historyPengirimanService.getHistoryPengirimanByStatusCode).toHaveBeenCalledWith('status-123');
    expect(reply.send).toHaveBeenCalledWith(mockData);
  });
});

