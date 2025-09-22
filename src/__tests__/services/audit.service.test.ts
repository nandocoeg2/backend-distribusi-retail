jest.mock('@/config/database', () => ({
  prisma: {
    auditTrail: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { createAuditLog, getAuditTrails } from '@/services/audit.service';
import { ActionType } from '@prisma/client';

const { prisma } = require('@/config/database');

describe('AuditService', () => {
  const mockAuditEntry = {
    id: 'audit-1',
    tableName: 'TestTable',
    recordId: 'record-1',
    action: 'CREATE',
    userId: 'user-1',
    details: { foo: 'bar' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('creates a new audit trail entry with provided data', async () => {
      (prisma.auditTrail.create as jest.Mock).mockResolvedValue(mockAuditEntry);

      const result = await createAuditLog(
        'TestTable',
        'record-1',
        'CREATE' as ActionType,
        'user-1',
        { foo: 'bar' }
      );

      expect(prisma.auditTrail.create).toHaveBeenCalledWith({
        data: {
          tableName: 'TestTable',
          recordId: 'record-1',
          action: 'CREATE',
          userId: 'user-1',
          details: { foo: 'bar' },
        },
      });
      expect(result).toEqual(mockAuditEntry);
    });
  });

  describe('getAuditTrails', () => {
    it('retrieves audit trails ordered by most recent', async () => {
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue([mockAuditEntry]);

      const result = await getAuditTrails('TestTable', 'record-1');

      expect(prisma.auditTrail.findMany).toHaveBeenCalledWith({
        where: {
          tableName: 'TestTable',
          recordId: 'record-1',
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
      expect(result).toEqual([mockAuditEntry]);
    });
  });
});
