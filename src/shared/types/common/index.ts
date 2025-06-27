/**
 * Common types used across the application
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NavigationState {
  routeName: string;
  params?: Record<string, any>;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Base interface for section component props
 */
export interface BaseSectionProps {
  style?: any;
  testID?: string;
}

/**
 * Base interface for section components that handle loading states
 */
export interface BaseLoadingSectionProps extends BaseSectionProps {
  loading?: boolean;
}
