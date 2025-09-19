import { prisma } from '@/config/database';
import { AuditTrailItem } from '@/types/common.types';

/**
 * Utility functions for audit trail operations
 */

/**
 * Get audit trails for a specific record with user information
 */
export async function getAuditTrailsForRecord(
  tableName: string,
  recordId: string
): Promise<AuditTrailItem[]> {
  return await prisma.auditTrail.findMany({
    where: {
      tableName,
      recordId,
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
  }) as AuditTrailItem[];
}

/**
 * Get entity by ID with audit trails attached
 */
export async function getEntityWithAuditTrails<T>(
  findQuery: Promise<T | null>,
  tableName: string,
  recordId: string,
  errorMessage: string = 'Entity not found'
): Promise<T & { auditTrails: AuditTrailItem[] }> {
  const entity = await findQuery;

  if (!entity) {
    const { AppError } = await import('@/utils/app-error');
    throw new AppError(errorMessage, 404);
  }

  const auditTrails = await getAuditTrailsForRecord(tableName, recordId);

  return {
    ...entity,
    auditTrails,
  };
}