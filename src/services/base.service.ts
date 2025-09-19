import { prisma } from '@/config/database';
import { Prisma, ActionType } from '@prisma/client';
import { AppError } from '@/utils/app-error';
import { createAuditLog } from '@/services/audit.service';
import { PaginatedResult } from '@/types/common.types';
import { calculatePagination, executePaginatedQuery } from '@/utils/pagination.utils';
import { getEntityWithAuditTrails } from '@/utils/audit.utils';

/**
 * Base service class with common CRUD operations
 */
export abstract class BaseService<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereInput extends Record<string, any> = { id: string }
> {
  protected abstract modelName: string;
  protected abstract tableName: string;
  protected abstract prismaModel: any;

  /**
   * Create a new entity
   */
  protected async createEntity(
    data: TCreateInput,
    userId: string,
    preprocessData?: (data: TCreateInput, userId: string) => any
  ): Promise<TModel> {
    try {
      const processedData = preprocessData 
        ? preprocessData(data, userId)
        : {
            ...data,
            createdBy: userId,
            updatedBy: userId,
          };

      const entity = await this.prismaModel.create({
        data: processedData,
      });

      await createAuditLog(this.tableName, entity.id, 'CREATE' as ActionType, userId, entity);

      return entity;
    } catch (error: any) {
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Get all entities with pagination
   */
  protected async getAllEntities(
    page: number = 1,
    limit: number = 10,
    include?: any,
    orderBy: any = { createdAt: 'desc' }
  ): Promise<PaginatedResult<TModel>> {
    const { skip, take } = calculatePagination(page, limit);

    const dataQuery = this.prismaModel.findMany({
      skip,
      take,
      include,
      orderBy,
    });

    const countQuery = this.prismaModel.count();

    return executePaginatedQuery(dataQuery, countQuery, page, limit);
  }

  /**
   * Get entity by ID with audit trails
   */
  protected async getEntityById(
    id: string,
    include?: any,
    errorMessage?: string
  ): Promise<TModel & { auditTrails: any[] }> {
    const findQuery = this.prismaModel.findUnique({
      where: { id },
      include,
    });

    return getEntityWithAuditTrails(
      findQuery,
      this.tableName,
      id,
      errorMessage || `${this.modelName} not found`
    );
  }

  /**
   * Update entity
   */
  protected async updateEntity(
    id: string,
    data: TUpdateInput,
    userId: string,
    preprocessData?: (data: TUpdateInput, userId: string) => any
  ): Promise<TModel> {
    try {
      // Check if entity exists
      const existingEntity = await this.prismaModel.findUnique({
        where: { id },
      });

      if (!existingEntity) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      const processedData = preprocessData
        ? preprocessData(data, userId)
        : {
            ...data,
            updatedBy: userId,
          };

      const updatedEntity = await this.prismaModel.update({
        where: { id },
        data: processedData,
      });

      await createAuditLog(this.tableName, updatedEntity.id, 'UPDATE' as ActionType, userId, {
        before: existingEntity,
        after: updatedEntity,
      });

      return updatedEntity;
    } catch (error: any) {
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Delete entity
   */
  protected async deleteEntity(id: string, userId: string): Promise<TModel> {
    const existingEntity = await this.prismaModel.findUnique({
      where: { id },
    });

    if (!existingEntity) {
      throw new AppError(`${this.modelName} not found`, 404);
    }

    await createAuditLog(this.tableName, id, 'DELETE' as ActionType, userId, existingEntity);

    return await this.prismaModel.delete({
      where: { id },
    });
  }

  /**
   * Search entities with pagination
   */
  protected async searchEntities(
    filters: any[],
    page: number = 1,
    limit: number = 10,
    include?: any,
    orderBy: any = { createdAt: 'desc' }
  ): Promise<PaginatedResult<TModel>> {
    const { skip, take } = calculatePagination(page, limit);

    const whereClause = filters.length > 0 ? { OR: filters } : {};

    const dataQuery = this.prismaModel.findMany({
      where: whereClause,
      skip,
      take,
      include,
      orderBy,
    });

    const countQuery = this.prismaModel.count({
      where: whereClause,
    });

    return executePaginatedQuery(dataQuery, countQuery, page, limit);
  }

  /**
   * Handle common database errors
   */
  protected handleDatabaseError(error: any): Error {
    if (error instanceof AppError) {
      return error;
    }

    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.length > 0) {
        return new AppError(`${this.modelName} with this ${target[0]} already exists`, 409);
      }
      return new AppError(`${this.modelName} already exists`, 409);
    }

    if (error.code === 'P2003') {
      return new AppError('Foreign key constraint violation', 400);
    }

    if (error.code === 'P2025') {
      return new AppError(`${this.modelName} not found`, 404);
    }

    return new AppError(`Error processing ${this.modelName.toLowerCase()}`, 500);
  }
}