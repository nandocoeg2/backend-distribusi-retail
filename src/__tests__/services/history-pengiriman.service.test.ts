import { prisma } from '../../config/database';
import { HistoryPengirimanService } from '../../services/history-pengiriman.service';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    historyPengiriman: {
      findMany: jest.fn(),
    },
  },
}));

describe('HistoryPengirimanService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all history pengiriman', async () => {
    const mockData = [{ id: '1', notes: 'Test' }];
    (prisma.historyPengiriman.findMany as jest.Mock).mockResolvedValue(mockData);

    const result = await HistoryPengirimanService.getAll();

    expect(prisma.historyPengiriman.findMany).toHaveBeenCalledWith({
      include: {
        suratJalan: true,
        status: true,
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should get history pengiriman by surat jalan id', async () => {
    const mockData = [{ id: '1', surat_jalan_id: 'sj-123' }];
    (prisma.historyPengiriman.findMany as jest.Mock).mockResolvedValue(mockData);

    const result = await HistoryPengirimanService.getBySuratJalanId('sj-123');

    expect(prisma.historyPengiriman.findMany).toHaveBeenCalledWith({
      where: { surat_jalan_id: 'sj-123' },
      include: {
        suratJalan: true,
        status: true,
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should get history pengiriman by tanggal kirim', async () => {
    const mockData = [{ id: '1', tanggal_kirim: new Date('2025-09-07') }];
    (prisma.historyPengiriman.findMany as jest.Mock).mockResolvedValue(mockData);
    const testDate = new Date('2025-09-07');

    const result = await HistoryPengirimanService.getByTanggalKirim(testDate);

    expect(prisma.historyPengiriman.findMany).toHaveBeenCalledWith({
      where: { tanggal_kirim: testDate },
      include: {
        suratJalan: true,
        status: true,
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should get history pengiriman by status code', async () => {
    const mockData = [{ id: '1', status_id: 'status-123' }];
    (prisma.historyPengiriman.findMany as jest.Mock).mockResolvedValue(mockData);

    const result = await HistoryPengirimanService.getByStatusCode('status-123');

    expect(prisma.historyPengiriman.findMany).toHaveBeenCalledWith({
      where: { status: { status_code: 'status-123' } },
      include: {
        suratJalan: true,
        status: true,
      },
    });
    expect(result).toEqual(mockData);
  });
});
