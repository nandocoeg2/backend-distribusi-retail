jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

jest.mock('@/config/database', () => ({
  prisma: {
    groupCustomer: {
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

import { GroupCustomerService } from '@/services/group-customer.service';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from '@/services/audit.service';

const { prisma } = require('@/config/database');

describe('GroupCustomerService', () => {
  const baseData = {
    id: 'group-1',
    kode_group: 'GRP-001',
    nama_group: 'Group 1',
    alamat: 'Jl. Test',
    npwp: '123',
  } as any;
  const createInput = {
    kode_group: 'GRP-001',
    nama_group: 'Group 1',
    alamat: 'Jl. Test',
    npwp: '123',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroupCustomer', () => {
    it('creates group customer and records audit log', async () => {
      (prisma.groupCustomer.create as jest.Mock).mockResolvedValue(baseData);

      const result = await GroupCustomerService.createGroupCustomer(createInput, 'user-1');

      expect(prisma.groupCustomer.create).toHaveBeenCalledWith({
        data: {
          kode_group: 'GRP-001',
          nama_group: 'Group 1',
          alamat: 'Jl. Test',
          npwp: '123',
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
      });
      expect(createAuditLog).toHaveBeenCalledWith('GroupCustomer', 'group-1', 'CREATE', 'user-1', baseData);
      expect(result).toEqual(baseData);
    });

    it('translates unique constraint violation to AppError', async () => {
      const error = { code: 'P2002', meta: { target: ['kode_group'] } };
      (prisma.groupCustomer.create as jest.Mock).mockRejectedValue(error);

      await expect(GroupCustomerService.createGroupCustomer(createInput, 'user-1')).rejects.toThrow(
        new AppError('GroupCustomer with this code already exists', 409)
      );
    });

    it('rethrows unexpected errors', async () => {
      const error = new Error('unknown');
      (prisma.groupCustomer.create as jest.Mock).mockRejectedValue(error);

      await expect(GroupCustomerService.createGroupCustomer(createInput, 'user-1')).rejects.toThrow(error);
    });
  });

  describe('getAllGroupCustomers', () => {
    it('returns paginated list', async () => {
      (prisma.groupCustomer.findMany as jest.Mock).mockResolvedValue([baseData]);
      (prisma.groupCustomer.count as jest.Mock).mockResolvedValue(1);

      const result = await GroupCustomerService.getAllGroupCustomers(2, 5);

      expect(prisma.groupCustomer.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.groupCustomer.count).toHaveBeenCalled();
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

  describe('getGroupCustomerById', () => {
    it('returns entity with audit trails', async () => {
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue(['trail']);

      const result = await GroupCustomerService.getGroupCustomerById('group-1');

      expect(result).toEqual({ ...baseData, auditTrails: ['trail'] });
      expect(prisma.auditTrail.findMany).toHaveBeenCalledWith({
        where: {
          tableName: 'GroupCustomer',
          recordId: 'group-1',
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
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(GroupCustomerService.getGroupCustomerById('missing')).rejects.toThrow(
        new AppError('GroupCustomer not found', 404)
      );
    });
  });

  describe('updateGroupCustomer', () => {
    it('updates existing entity and logs audit', async () => {
      const updated = { ...baseData, nama_group: 'Updated' };
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.groupCustomer.update as jest.Mock).mockResolvedValue(updated);

      const updatePayload = {
        kode_group: 'GRP-001',
        nama_group: 'Updated',
        alamat: 'Jl. Test',
        npwp: '123',
      } as any;

      const result = await GroupCustomerService.updateGroupCustomer('group-1', updatePayload, 'user-2');

      expect(prisma.groupCustomer.update).toHaveBeenCalledWith({
        where: { id: 'group-1' },
        data: {
          kode_group: 'GRP-001',
          nama_group: 'Updated',
          alamat: 'Jl. Test',
          npwp: '123',
          updatedBy: 'user-2',
        },
      });
      expect(createAuditLog).toHaveBeenCalledWith('GroupCustomer', 'group-1', 'UPDATE', 'user-2', {
        before: baseData,
        after: updated,
      });
      expect(result).toEqual(updated);
    });

    it('throws AppError when entity missing', async () => {
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(GroupCustomerService.updateGroupCustomer('missing', createInput, 'user')).rejects.toThrow(
        new AppError('GroupCustomer not found', 404)
      );
    });
  });

  describe('deleteGroupCustomer', () => {
    it('deletes entity after logging audit', async () => {
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(baseData);
      (prisma.groupCustomer.delete as jest.Mock).mockResolvedValue(baseData);

      const result = await GroupCustomerService.deleteGroupCustomer('group-1', 'user-3');

      expect(createAuditLog).toHaveBeenCalledWith('GroupCustomer', 'group-1', 'DELETE', 'user-3', baseData);
      expect(prisma.groupCustomer.delete).toHaveBeenCalledWith({ where: { id: 'group-1' } });
      expect(result).toEqual(baseData);
    });

    it('throws AppError when entity not found', async () => {
      (prisma.groupCustomer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(GroupCustomerService.deleteGroupCustomer('missing', 'user')).rejects.toThrow(
        new AppError('GroupCustomer not found', 404)
      );
    });
  });

  describe('searchGroupCustomers', () => {
    it('returns all customers when query absent', async () => {
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
        .spyOn(GroupCustomerService, 'getAllGroupCustomers')
        .mockResolvedValue(mockResult as any);

      const result = await GroupCustomerService.searchGroupCustomers(undefined, 1, 10);

      expect(getAllSpy).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(mockResult);
    });

    it('searches using OR filters when query provided', async () => {
      (prisma.groupCustomer.findMany as jest.Mock).mockResolvedValue([baseData]);
      (prisma.groupCustomer.count as jest.Mock).mockResolvedValue(1);

      const result = await GroupCustomerService.searchGroupCustomers('grp', 2, 5);

      expect(prisma.groupCustomer.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { kode_group: { contains: 'grp', mode: 'insensitive' } },
            { nama_group: { contains: 'grp', mode: 'insensitive' } },
            { alamat: { contains: 'grp', mode: 'insensitive' } },
            { npwp: { contains: 'grp', mode: 'insensitive' } },
          ],
        },
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.groupCustomer.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { kode_group: { contains: 'grp', mode: 'insensitive' } },
            { nama_group: { contains: 'grp', mode: 'insensitive' } },
            { alamat: { contains: 'grp', mode: 'insensitive' } },
            { npwp: { contains: 'grp', mode: 'insensitive' } },
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
