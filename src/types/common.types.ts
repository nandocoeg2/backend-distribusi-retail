/**
 * Common types and interfaces used across the application
 */

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AuditTrailItem {
  id: string;
  tableName: string;
  recordId: string;
  action: string;
  timestamp: Date;
  userId: string;
  details: any;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface EntityWithAuditTrails<T> extends BaseEntity {
  auditTrails: AuditTrailItem[];
}