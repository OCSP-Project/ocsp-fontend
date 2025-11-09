// src/types/common.types.ts

/**
 * Common API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Common status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Common filter parameters
 */
export interface FilterParams {
  search?: string;
  status?: Status;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

/**
 * ID types
 */
export type ID = string | number;

/**
 * Timestamp fields
 */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * Soft delete fields
 */
export interface SoftDelete extends Timestamps {
  deletedAt?: string;
}

/**
 * Entity with metadata
 */
export interface EntityWithMetadata extends Timestamps {
  id: string;
  createdBy?: string;
  updatedBy?: string;
}
