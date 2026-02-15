// Generic API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// Generic Error Response Type
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Keys Type
export type QueryKey = readonly [string, Record<string, unknown>?];
