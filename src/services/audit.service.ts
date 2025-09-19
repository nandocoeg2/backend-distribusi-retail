import { ActionType, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

/**
 * Creates an audit log entry.
 * @param tableName - The name of the table where the action occurred.
 * @param recordId - The ID of the record that was affected.
 * @param action - The type of action performed (CREATE, UPDATE, DELETE).
 * @param userId - The ID of the user who performed the action.
 * @param details - A JSON object containing details about the change.
 * @returns The created audit trail entry.
 */
export const createAuditLog = async (
  tableName: string,
  recordId: string,
  action: ActionType,
  userId: string,
  details: Prisma.InputJsonValue
) => {
  return await prisma.auditTrail.create({
    data: {
      tableName,
      recordId,
      action,
      userId,
      details,
    },
  });
};

/**
 * Gets audit trail entries for a specific record.
 * @param tableName - The name of the table to query.
 * @param recordId - The ID of the record to get audit trails for.
 * @returns Array of audit trail entries with user information.
 */
export const getAuditTrails = async (
  tableName: string,
  recordId: string
) => {
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
  });
};
