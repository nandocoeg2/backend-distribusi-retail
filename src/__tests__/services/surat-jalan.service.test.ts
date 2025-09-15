import { SuratJalanService } from '@/services/surat-jalan.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

jest.mock('@/config/database', () => ({
  prisma: {
    suratJalan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    suratJalanDetail: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    suratJalanDetailItem: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    historyPengiriman: {
      deleteMany: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('SuratJalanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSuratJalan', () => {
    it('should create a surat jalan with details', async () => {
      const createInput = {
        no_surat_jalan: 'SJ-2024-001',
        deliver_to: 'Customer ABC',
        PIC: 'John Doe',
        alamat_tujuan: 'Jl. Example No. 123, Jakarta',
        invoiceId: 'inv123',
        createdBy: 'user123',
        updatedBy: 'user123',
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

      const createdSuratJalan = {
        id: '1',
        ...createInput,
        is_printed: false,
        print_counter: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({ id: 'inv123' });
      (prisma.suratJalan.create as jest.Mock).mockResolvedValue(createdSuratJalan);

      const result = await SuratJalanService.createSuratJalan(createInput);

      expect(prisma.suratJalan.create).toHaveBeenCalledWith({
        data: {
          no_surat_jalan: 'SJ-2024-001',
          deliver_to: 'Customer ABC',
          PIC: 'John Doe',
          alamat_tujuan: 'Jl. Example No. 123, Jakarta',
          invoiceId: 'inv123',
          createdBy: 'user123',
          updatedBy: 'user123',
          suratJalanDetails: {
            create: expect.any(Array),
          },
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(createdSuratJalan);
    });

    it('should handle duplicate no_surat_jalan error', async () => {
      const createInput = {
        no_surat_jalan: 'SJ-2024-001',
        deliver_to: 'Customer ABC',
        PIC: 'John Doe',
        alamat_tujuan: 'Jl. Example No. 123, Jakarta',
        suratJalanDetails: [],
      };

      const error = new Error('Database error');
      (error as any).code = 'P2002';
      (error as any).meta = { target: ['no_surat_jalan'] };
      
      (prisma.suratJalan.create as jest.Mock).mockRejectedValue(error);

      await expect(SuratJalanService.createSuratJalan(createInput))
        .rejects.toThrow('Surat jalan with this number already exists');
    });
  });

  describe('getAllSuratJalan', () => {
    it('should return paginated surat jalan', async () => {
      const suratJalan = [
        { id: '1', no_surat_jalan: 'SJ-001' },
        { id: '2', no_surat_jalan: 'SJ-002' },
      ];
      const totalItems = 2;

      (prisma.suratJalan.findMany as jest.Mock).mockResolvedValue(suratJalan);
      (prisma.suratJalan.count as jest.Mock).mockResolvedValue(totalItems);

      const result = await SuratJalanService.getAllSuratJalan(1, 10);

      expect(prisma.suratJalan.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(prisma.suratJalan.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: suratJalan,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getSuratJalanById', () => {
    it('should return surat jalan by id', async () => {
      const suratJalan = {
        id: '1',
        no_surat_jalan: 'SJ-001',
        suratJalanDetails: [],
        invoice: null,
        historyPengiriman: [],
      };

      (prisma.suratJalan.findUnique as jest.Mock).mockResolvedValue(suratJalan);

      const result = await SuratJalanService.getSuratJalanById('1');

      expect(prisma.suratJalan.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(suratJalan);
    });

    it('should return null when surat jalan not found', async () => {
      (prisma.suratJalan.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await SuratJalanService.getSuratJalanById('999');

      expect(result).toBeNull();
    });
  });

  describe('updateSuratJalan', () => {
    it('should update surat jalan successfully', async () => {
      const updateData = {
        deliver_to: 'Updated Customer',
        PIC: 'Jane Doe',
      };
      const existingSuratJalan = { id: '1', no_surat_jalan: 'SJ-001' };
      const updatedSuratJalan = { ...existingSuratJalan, ...updateData };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          suratJalan: {
            findUnique: jest.fn().mockResolvedValue(existingSuratJalan),
            update: jest.fn().mockResolvedValue(updatedSuratJalan),
          },
          suratJalanDetail: {
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn(),
          },
          suratJalanDetailItem: {
            deleteMany: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const result = await SuratJalanService.updateSuratJalan('1', updateData);

      expect(result).toEqual(updatedSuratJalan);
    });

    it('should throw error when surat jalan not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          suratJalan: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx);
      });

      await expect(
        SuratJalanService.updateSuratJalan('999', { deliver_to: 'Updated' })
      ).rejects.toThrow('Surat jalan not found');
    });

    it('should handle duplicate no_surat_jalan error during update', async () => {
      const updateData = { no_surat_jalan: 'SJ-2024-002' };
      const existingSuratJalan = { id: '1', no_surat_jalan: 'SJ-001' };
      const error = new Error('Database error');
      (error as any).code = 'P2002';
      (error as any).meta = { target: ['no_surat_jalan'] };

      (prisma.$transaction as jest.Mock).mockRejectedValue(error);

      await expect(
        SuratJalanService.updateSuratJalan('1', updateData)
      ).rejects.toThrow('Surat jalan with this number already exists');
    });
  });

  describe('deleteSuratJalan', () => {
    it('should delete surat jalan successfully with related data', async () => {
      const suratJalanToDelete = {
        id: '1',
        no_surat_jalan: 'SJ-001',
        suratJalanDetails: [
          {
            id: 'detail1',
            suratJalanDetailItems: [
              { id: 'item1', nama_barang: 'Product A' }
            ]
          }
        ],
        invoice: null,
        historyPengiriman: []
      };

      (prisma.suratJalan.findUnique as jest.Mock).mockResolvedValue(suratJalanToDelete);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          suratJalanDetailItem: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          suratJalanDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          historyPengiriman: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 })
          },
          suratJalan: {
            delete: jest.fn().mockResolvedValue(suratJalanToDelete)
          }
        };
        return callback(mockTx);
      });

      const result = await SuratJalanService.deleteSuratJalan('1');

      expect(prisma.suratJalan.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(suratJalanToDelete);
    });

    it('should return null when surat jalan not found', async () => {
      (prisma.suratJalan.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await SuratJalanService.deleteSuratJalan('999');

      expect(result).toBeNull();
    });

    it('should return null when deletion fails', async () => {
      const suratJalanToDelete = { id: '1', no_surat_jalan: 'SJ-001' };
      (prisma.suratJalan.findUnique as jest.Mock).mockResolvedValue(suratJalanToDelete);
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await SuratJalanService.deleteSuratJalan('1');

      expect(result).toBeNull();
    });
  });

  describe('searchSuratJalan', () => {
    it('should search surat jalan with filters', async () => {
      const query = {
        no_surat_jalan: 'SJ',
        deliver_to: 'Customer',
        PIC: 'John',
        invoiceId: 'inv123',
        is_printed: true,
        page: 1,
        limit: 10,
      };
      const suratJalan = [
        { id: '1', no_surat_jalan: 'SJ-001', deliver_to: 'Customer ABC' },
      ];
      const totalItems = 1;

      (prisma.suratJalan.findMany as jest.Mock).mockResolvedValue(suratJalan);
      (prisma.suratJalan.count as jest.Mock).mockResolvedValue(totalItems);

      const result = await SuratJalanService.searchSuratJalan(query);

      expect(prisma.suratJalan.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              no_surat_jalan: expect.objectContaining({ contains: 'SJ' }),
            }),
          ]),
        }),
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual({
        data: suratJalan,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });

    it('should search without filters', async () => {
      const query = { page: 1, limit: 10 };
      const suratJalan = [
        { id: '1', no_surat_jalan: 'SJ-001' },
      ];
      const totalItems = 1;

      (prisma.suratJalan.findMany as jest.Mock).mockResolvedValue(suratJalan);
      (prisma.suratJalan.count as jest.Mock).mockResolvedValue(totalItems);

      const result = await SuratJalanService.searchSuratJalan(query);

      expect(prisma.suratJalan.findMany).toHaveBeenCalledWith({
        where: {
          AND: undefined,
        },
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual({
        data: suratJalan,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });
});
