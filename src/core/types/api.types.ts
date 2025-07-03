/**
 * API Types
 * 
 * Comprehensive type definitions for API operations including:
 * - Request/response structures
 * - Pagination utilities
 * - Error handling
 * - Async state management
 * 
 * @module @core/types/api
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// REQUEST TYPES
// ========================================

/**
 * Standard pagination parameters for API requests
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Number of items to skip */
  offset?: number;
}

/**
 * Sorting parameters for API requests
 */
export interface SortParams {
  /** Field to sort by */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base API request parameters
 */
export interface BaseApiParams extends PaginationParams, SortParams {
  /** Search query string */
  search?: string;
  /** Additional filters */
  filters?: Record<string, string | number | boolean | string[]>;
}

// ========================================
// RESPONSE TYPES
// ========================================

/**
 * Pagination metadata for API responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Paginated API response wrapper
 */
export interface PaginationResponse<T> {
  /** Response data array */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Success message */
  message?: string;
  /** Error message */
  error?: string;
  /** Additional metadata */
  meta?: Record<string, string | number | boolean>;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  /** Error occurred flag */
  success: false;
  /** Error message */
  error: string;
  /** Error code */
  code?: string;
  /** Detailed error information */
  details?: Record<string, string | number | boolean>;
  /** Request timestamp */
  timestamp?: string;
}

// ========================================
// STATE MANAGEMENT TYPES
// ========================================

/**
 * Async operation state for components
 */
export interface AsyncState<T> {
  /** Current data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Enhanced async state with additional metadata
 */
export interface EnhancedAsyncState<T> extends AsyncState<T> {
  /** Whether data has been initially loaded */
  initialized: boolean;
  /** Whether currently refreshing */
  refreshing: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
}

// ========================================
// HTTP TYPES
// ========================================

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP status codes commonly used in the app
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Request configuration for API calls
 */
export interface RequestConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Request headers */
  headers?: Record<string, string>;
  /** Whether to include authentication */
  requiresAuth?: boolean;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryAttempts?: number;
}

// ========================================
// ERROR HANDLING TYPES
// ========================================

/**
 * Structured API error details
 */
export interface ApiErrorDetails {
  /** HTTP status code */
  status?: number;
  /** Error message */
  message: string;
  /** Whether error is network-related */
  isNetworkError: boolean;
  /** Whether error is server-related */
  isServerError: boolean;
  /** Original error object */
  originalError: Error | unknown;
  /** Additional error data */
  data?: Record<string, string | number | boolean>;
}

// ========================================
// THROTTLING TYPES  
// ========================================

/**
 * API throttling store interface
 */
export interface ThrottleStore {
  /** Throttle entries keyed by endpoint */
  [key: string]: {
    /** Last API call timestamp */
    lastCallTime: number;
    /** Minimum interval between calls in ms */
    minInterval: number;
  };
}

/**
 * Throttling configuration
 */
export interface ThrottleConfig {
  /** Minimum interval between calls in milliseconds */
  interval: number;
  /** Maximum number of queued requests */
  maxQueue: number;
  /** Whether to drop requests when throttled */
  dropOnThrottle: boolean;
}

// ========================================
// HTTP CLIENT TYPES
// ========================================

/**
 * Axios-compatible request configuration
 */
export type AxiosRequestConfig = {
  /** HTTP method */
  method?: string;
  /** Request URL */
  url?: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body data */
  data?: unknown;
  /** URL parameters */
  params?: Record<string, string | number | boolean>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Additional axios options */
  [key: string]: unknown;
};

/**
 * Axios-compatible response type
 */
export type AxiosResponse<T = unknown> = {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Request configuration */
  config: AxiosRequestConfig;
};