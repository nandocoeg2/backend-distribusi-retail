jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

jest.mock('@/config/database', () => ({
  prisma: {
    termOfPayment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditTrail: {
      findMany: jest.fn(),
    },
  },
}));

import { TermOfPaymentService } from '@/services/term-of-payment.service';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from '@/services/audit.service';

const { prisma } = require('@/config/database');

describe('TermOfPaymentService', () => {
  const baseData = {
    id: 'top-1',
    kode_top: 'TOP-30',
    batas_hari: 30,
  } as any;
  const createInput = {
    kode_top: 'TOP-30',
    batas_hari: 30,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTermOfPayment', () => {
    it('creates new term of payment and logs audit', async () => {
      (prisma.termOfPayment.create as jest.Mock).mockResolvedValue(baseData);

      const result = await TermOfPaymentService.createTermOfPayment(createInput, 'user-1');

      expect(prisma.termOfPayment.create).toHaveBeenCalledWith({
        data: {
          kode_top: 'TOP-30',
          batas_hari: 30,
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
      });
      expect(createAuditLog).toHaveBeenCalledWith('TermOfPayment', 'top-1', 'CREATE', 'user-1', baseData);
      expect(result).toEqual(baseData);
    });

    it('throws AppError for duplicate kode_top', async () => {
      const error = { code: 'P2002', meta: { target: ['kode_top'] } };
      (prisma.termOfPayment.create as jest.Mock).mockRejectedValue(error);

      await expect(TermOfPaymentService.createTermOfPayment(createInput, 'user-1')).rejects.toThrow(
        new AppError('Term of Payment with this code already exists', 409)
      );
    });

    it('rethrows unexpected errors', async () => {
      const error = new Error('unexpected');
      (prisma.termOfPayment.create as jest.Mock).mockRejectedValue(error);

      await expect(TermOfPaymentService.createTermOfPayment(createInput, 'user-1')).rejects.toThrow(error);
    });
  });

  describe('getAllTermOfPayments', () => {
    it('returns paginated list of term of payments', async () => {
      (prisma.termOfPayment.findMany as jest.Mock).mockResolvedValue([baseData]);
      (prisma.termOfPayment.count as jest.Mock).mockResolvedValue(1);

      const result = await TermOfPaymentService.getAllTermOfPayments(2, 5);

      expect(prisma.termOfPayment.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.termOfPayment.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: [baseData],
        pagination: {
          currentPage: 2,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 5,
        },
      });
    });
  });

  describe('getTermOfPaymentById', () => {
    it('returns entity with audit trails', async () => {
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue(['trail']);

      const result = await TermOfPaymentService.getTermOfPaymentById('top-1');

      expect(result).toEqual({ ...baseData, auditTrails: ['trail'] });
      expect(prisma.auditTrail.findMany).toHaveBeenCalledWith({
        where: {
          tableName: 'TermOfPayment',
          recordId: 'top-1',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('throws AppError when entity not found', async () => {
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TermOfPaymentService.getTermOfPaymentById('missing')).rejects.toThrow(
        new AppError('Term of Payment not found', 404)
      );
    });
  });

  describe('updateTermOfPayment', () => {
    it('updates existing entity and writes audit log', async () => {
      const updated = { ...baseData, batas_hari: 45 };
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.termOfPayment.update as jest.Mock).mockResolvedValue(updated);

      const updatePayload = {
        kode_top: 'TOP-30',
        batas_hari: 45,
      } as any;

      const result = await TermOfPaymentService.updateTermOfPayment('top-1', updatePayload, 'user-2');

      expect(prisma.termOfPayment.update).toHaveBeenCalledWith({
        where: { id: 'top-1' },
        data: {
          kode_top: 'TOP-30',
          batas_hari: 45,
          updatedBy: 'user-2',
        },
      });
      expect(createAuditLog).toHaveBeenCalledWith('TermOfPayment', 'top-1', 'UPDATE', 'user-2', {
        before: baseData,
        after: updated,
      });
      expect(result).toEqual(updated);
    });

    it('throws AppError when entity not found', async () => {
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TermOfPaymentService.updateTermOfPayment('missing', createInput, 'user')).rejects.toThrow(
        new AppError('Term of Payment not found', 404)
      );
    });
  });

  describe('deleteTermOfPayment', () => {
    it('deletes entity and logs audit', async () => {
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.termOfPayment.delete as jest.Mock).mockResolvedValue(baseData);

      const result = await TermOfPaymentService.deleteTermOfPayment('top-1', 'user-3');

      expect(createAuditLog).toHaveBeenCalledWith('TermOfPayment', 'top-1', 'DELETE', 'user-3', baseData);
      expect(prisma.termOfPayment.delete).toHaveBeenCalledWith({ where: { id: 'top-1' } });
      expect(result).toEqual(baseData);
    });

    it('throws AppError when entity missing', async () => {
      (prisma.termOfPayment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TermOfPaymentService.deleteTermOfPayment('missing', 'user')).rejects.toThrow(
        new AppError('Term of Payment not found', 404)
      );
    });
  });

  describe('searchTermOfPayments', () => {
    it('returns all term of payments when query omitted', async () => {
      const mockResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };
      const getAllSpy = jest
        .spyOn(TermOfPaymentService, 'getAllTermOfPayments')
        .mockResolvedValue(mockResult as any);

      const result = await TermOfPaymentService.searchTermOfPayments(undefined, 1, 10);

      expect(getAllSpy).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(mockResult);
    });

    it('searches using OR filters including numeric parsing', async () => {
      (prisma.termOfPayment.findMany as jest.Mock).mockResolvedValue([baseData]);
      (prisma.termOfPayment.count as jest.Mock).mockResolvedValue(1);

      const result = await TermOfPaymentService.searchTermOfPayments('30', 2, 5);

      expect(prisma.termOfPayment.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { kode_top: { contains: '30', mode: 'insensitive' } },
            { batas_hari: { equals: 30 } },
          ],
        },
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.termOfPayment.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { kode_top: { contains: '30', mode: 'insensitive' } },
            { batas_hari: { equals: 30 } },
          ],
        },
      });
      expect(result).toEqual({
        data: [baseData],
        pagination: {
          currentPage: 2,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 5,
        },
      });
    });
  });
});
