jest.mock('@/config/database', () => ({
  prisma: {
    status: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { StatusService } from '@/services/status.service';

const { prisma } = require('@/config/database');

describe('StatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllStatuses orders by category then status name', async () => {
    (prisma.status.findMany as jest.Mock).mockResolvedValue(['status']);

    const result = await StatusService.getAllStatuses();

    expect(prisma.status.findMany).toHaveBeenCalledWith({
      orderBy: [
        { category: 'asc' },
        { status_name: 'asc' },
      ],
    });
    expect(result).toEqual(['status']);
  });

  it('getStatusesByCategory filters by provided category', async () => {
    (prisma.status.findMany as jest.Mock).mockResolvedValue(['filtered']);

    const result = await StatusService.getStatusesByCategory('Invoice');

    expect(prisma.status.findMany).toHaveBeenCalledWith({
      where: { category: 'Invoice' },
      orderBy: { status_name: 'asc' },
    });
    expect(result).toEqual(['filtered']);
  });

  it.each([
    ['getStatusesByPurchaseOrder', 'Purchase Order'],
    ['getStatusesByBulkFile', 'Bulk File Processing'],
    ['getStatusesByPacking', 'Packing'],
    ['getStatusesByPackingItem', 'Packing Detail Item'],
    ['getStatusesByInvoice', 'Invoice'],
    ['getStatusesBySuratJalan', 'Surat Jalan'],
  ])('%s queries statuses by predefined category', async (methodName, category) => {
    (prisma.status.findMany as jest.Mock).mockResolvedValue(['predefined']);

    const result = await (StatusService as any)[methodName]();

    expect(prisma.status.findMany).toHaveBeenCalledWith({
      where: { category },
      orderBy: { status_name: 'asc' },
    });
    expect(result).toEqual(['predefined']);
  });

  it('getStatusByCodeAndCategory loads using composite unique key', async () => {
    (prisma.status.findUnique as jest.Mock).mockResolvedValue('status');

    const result = await StatusService.getStatusByCodeAndCategory('PO-PENDING', 'Purchase Order');

    expect(prisma.status.findUnique).toHaveBeenCalledWith({
      where: {
        status_code_category: {
          status_code: 'PO-PENDING',
          category: 'Purchase Order',
        },
      },
    });
    expect(result).toEqual('status');
  });

  it('getAllCategories returns distinct category names', async () => {
    (prisma.status.findMany as jest.Mock).mockResolvedValue([
      { category: 'Invoice' },
      { category: 'Purchase Order' },
    ]);

    const result = await StatusService.getAllCategories();

    expect(prisma.status.findMany).toHaveBeenCalledWith({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    expect(result).toEqual(['Invoice', 'Purchase Order']);
  });
});
