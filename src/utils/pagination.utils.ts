import { PaginatedResult } from '@/types/common.types';

/**
 * Utility functions for pagination
 */

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationData {
  skip: number;
  take: number;
}

/**
 * Calculate skip and take values for pagination
 */
export function calculatePagination(page: number = 1, limit: number = 10): PaginationData {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: parseInt(limit.toString()),
  };
}

/**
 * Build paginated result object
 */
export function buildPaginatedResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  };
}

/**
 * Execute paginated query and return formatted result
 */
export async function executePaginatedQuery<T>(
  dataQuery: Promise<T[]>,
  countQuery: Promise<number>,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult<T>> {
  const [data, totalItems] = await Promise.all([dataQuery, countQuery]);
  return buildPaginatedResult(data, totalItems, page, limit);
}