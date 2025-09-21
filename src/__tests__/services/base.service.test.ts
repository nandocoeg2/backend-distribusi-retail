jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

jest.mock('@/utils/audit.utils', () => ({
  getEntityWithAuditTrails: jest.fn(),
}));

jest.mock('@/config/database', () => ({
  prisma: {
    testModel: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { BaseService } from '@/services/base.service';
import { createAuditLog } from '@/services/audit.service';
import { getEntityWithAuditTrails } from '@/utils/audit.utils';
import { AppError } from '@/utils/app-error';

const { prisma } = require('@/config/database');

interface TestModel {
  id: string;
  name: string;
}

class ConcreteTestService extends BaseService<TestModel, { name: string }, { name?: string }> {
  protected modelName = 'TestModel';
  protected tableName = 'TestTable';
  protected prismaModel = prisma.testModel;

  public create(data: { name: string }, userId: string, preprocess?: any) {
    return this.createEntity(data, userId, preprocess);
  }

  public getAll(page?: number, limit?: number, include?: any, orderBy?: any) {
    return this.getAllEntities(page, limit, include, orderBy);
  }

  public getById(id: string, include?: any, errorMessage?: string) {
    return this.getEntityById(id, include, errorMessage);
  }

  public update(id: string, data: { name?: string }, userId: string, preprocess?: any) {
    return this.updateEntity(id, data, userId, preprocess);
  }

  public delete(id: string, userId: string) {
    return this.deleteEntity(id, userId);
  }

  public search(filters: any[], page?: number, limit?: number, include?: any, orderBy?: any) {
    return this.searchEntities(filters, page, limit, include, orderBy);
  }

  public handle(error: any) {
    return this.handleDatabaseError(error);
  }
}

describe('BaseService', () => {
  const service = new ConcreteTestService();
  const mockEntity: TestModel = { id: 'entity-1', name: 'Test' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEntity', () => {
    it('creates a new entity and writes audit log', async () => {
      (prisma.testModel.create as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.create({ name: 'Test' }, 'user-1');

      expect(prisma.testModel.create).toHaveBeenCalledWith({
        data: {
          name: 'Test',
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
      });
      expect(createAuditLog).toHaveBeenCalledWith('TestTable', 'entity-1', 'CREATE', 'user-1', mockEntity);
      expect(result).toEqual(mockEntity);
    });

    it('applies preprocess hook when provided', async () => {
      (prisma.testModel.create as jest.Mock).mockResolvedValue(mockEntity);

      const preprocess = jest.fn().mockReturnValue({ name: 'Processed', createdBy: 'override', updatedBy: 'override' });

      await service.create({ name: 'Raw' }, 'user-1', preprocess);

      expect(preprocess).toHaveBeenCalledWith({ name: 'Raw' }, 'user-1');
      expect(prisma.testModel.create).toHaveBeenCalledWith({
        data: { name: 'Processed', createdBy: 'override', updatedBy: 'override' },
      });
    });

    it('translates prisma unique constraint errors into AppError', async () => {
      const prismaError = { code: 'P2002', meta: { target: ['name'] } };
      (prisma.testModel.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.create({ name: 'Test' }, 'user-1')).rejects.toThrow(
        new AppError('TestModel with this name already exists', 409)
      );
    });
  });

  describe('getAllEntities', () => {
    it('returns paginated results using shared pagination utilities', async () => {
      (prisma.testModel.findMany as jest.Mock).mockResolvedValue([mockEntity]);
      (prisma.testModel.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAll(2, 5);

      expect(prisma.testModel.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        include: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.testModel.count).toHaveBeenCalledWith();
      expect(result).toEqual({
        data: [mockEntity],
        pagination: {
          currentPage: 2,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 5,
        },
      });
    });
  });

  describe('getEntityById', () => {
    it('delegates to audit utility to hydrate audit trails', async () => {
      (prisma.testModel.findUnique as jest.Mock).mockReturnValue(Promise.resolve(mockEntity));
      (getEntityWithAuditTrails as jest.Mock).mockResolvedValue({ ...mockEntity, auditTrails: [] });

      const result = await service.getById('entity-1', { include: true }, 'Custom not found message');

      expect(prisma.testModel.findUnique).toHaveBeenCalledWith({ where: { id: 'entity-1' }, include: { include: true } });
      expect(getEntityWithAuditTrails).toHaveBeenCalledWith(
        expect.any(Promise),
        'TestTable',
        'entity-1',
        'Custom not found message'
      );
      expect(result).toEqual({ ...mockEntity, auditTrails: [] });
    });
  });

  describe('updateEntity', () => {
    it('updates existing entity and writes audit log', async () => {
      const existingEntity = { id: 'entity-1', name: 'Old' };
      const updatedEntity = { id: 'entity-1', name: 'Updated' };
      (prisma.testModel.findUnique as jest.Mock).mockResolvedValue(existingEntity);
      (prisma.testModel.update as jest.Mock).mockResolvedValue(updatedEntity);

      const result = await service.update('entity-1', { name: 'Updated' }, 'user-1');

      expect(prisma.testModel.update).toHaveBeenCalledWith({
        where: { id: 'entity-1' },
        data: { name: 'Updated', updatedBy: 'user-1' },
      });
      expect(createAuditLog).toHaveBeenCalledWith('TestTable', 'entity-1', 'UPDATE', 'user-1', {
        before: existingEntity,
        after: updatedEntity,
      });
      expect(result).toEqual(updatedEntity);
    });

    it('throws AppError when entity is not found', async () => {
      (prisma.testModel.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('missing', { name: 'x' }, 'user-1')).rejects.toThrow(
        new AppError('TestModel not found', 404)
      );
    });
  });

  describe('deleteEntity', () => {
    it('deletes an existing entity and records audit log', async () => {
      (prisma.testModel.findUnique as jest.Mock).mockResolvedValue(mockEntity);
      (prisma.testModel.delete as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.delete('entity-1', 'user-1');

      expect(createAuditLog).toHaveBeenCalledWith('TestTable', 'entity-1', 'DELETE', 'user-1', mockEntity);
      expect(prisma.testModel.delete).toHaveBeenCalledWith({ where: { id: 'entity-1' } });
      expect(result).toEqual(mockEntity);
    });

    it('throws AppError when entity does not exist', async () => {
      (prisma.testModel.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('missing', 'user-1')).rejects.toThrow(new AppError('TestModel not found', 404));
    });
  });

  describe('searchEntities', () => {
    it('searches entities with OR filters and pagination', async () => {
      (prisma.testModel.findMany as jest.Mock).mockResolvedValue([mockEntity]);
      (prisma.testModel.count as jest.Mock).mockResolvedValue(1);

      const filters = [{ name: { contains: 'test' } }];
      const result = await service.search(filters, 1, 10);

      expect(prisma.testModel.findMany).toHaveBeenCalledWith({
        where: { OR: filters },
        skip: 0,
        take: 10,
        include: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.testModel.count).toHaveBeenCalledWith({ where: { OR: filters } });
      expect(result).toEqual({
        data: [mockEntity],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('handleDatabaseError', () => {
    it('returns AppError for foreign key violations', () => {
      const error = service.handle({ code: 'P2003' });
      expect(error).toEqual(new AppError('Foreign key constraint violation', 400));
    });

    it('returns AppError for missing records', () => {
      const error = service.handle({ code: 'P2025' });
      expect(error).toEqual(new AppError('TestModel not found', 404));
    });

    it('returns generic AppError for unknown errors', () => {
      const error = service.handle({});
      expect(error).toEqual(new AppError('Error processing testmodel', 500));
    });
  });
});
