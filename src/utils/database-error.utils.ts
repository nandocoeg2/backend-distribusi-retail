import { AppError } from '@/utils/app-error';

/**
 * Common database error handling utilities
 */

/**
 * Handle Prisma database errors and convert to AppError
 */
export function handleDatabaseError(error: any, entityName: string = 'Entity'): Error {
  if (error instanceof AppError) {
    return error;
  }

  // Unique constraint violation
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    if (Array.isArray(target) && target.length > 0) {
      const field = target[0];
      return new AppError(`${entityName} with this ${field} already exists`, 409);
    }
    return new AppError(`${entityName} already exists`, 409);
  }

  // Foreign key constraint violation
  if (error.code === 'P2003') {
    const field = error.meta?.field_name;
    if (field) {
      return new AppError(`Invalid reference: ${field} not found`, 400);
    }
    return new AppError('Foreign key constraint violation', 400);
  }

  // Record not found
  if (error.code === 'P2025') {
    return new AppError(`${entityName} not found`, 404);
  }

  // Transaction failed
  if (error.code === 'P2034') {
    return new AppError('Transaction failed due to conflict', 409);
  }

  // Connection error
  if (error.code === 'P1001') {
    return new AppError('Database connection failed', 503);
  }

  // Default error
  return new AppError(`Error processing ${entityName.toLowerCase()}`, 500);
}

/**
 * Handle specific unique constraint errors with custom messages
 */
export function handleUniqueConstraintError(
  error: any,
  entityName: string,
  fieldMessages: Record<string, string>
): Error {
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    if (Array.isArray(target) && target.length > 0) {
      const field = target[0];
      const customMessage = fieldMessages[field];
      if (customMessage) {
        return new AppError(customMessage, 409);
      }
      return new AppError(`${entityName} with this ${field} already exists`, 409);
    }
    return new AppError(`${entityName} already exists`, 409);
  }
  
  return handleDatabaseError(error, entityName);
}

/**
 * Handle foreign key constraint errors with custom messages  
 */
export function handleForeignKeyError(
  error: any,
  entityName: string,
  fieldMessages: Record<string, string>
): Error {
  if (error.code === 'P2003') {
    const field = error.meta?.field_name as string;
    if (field) {
      const customMessage = fieldMessages[field];
      if (customMessage) {
        return new AppError(customMessage, 404);
      }
    }
  }
  
  return handleDatabaseError(error, entityName);
}