/**
 * Error Handling Utilities
 *
 * Comprehensive error handling, formatting, and logging utilities
 * for consistent error management across the application.
 * 
 * @module @core/utils/error
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../log";

// ========================================
// GENERAL ERROR HANDLING
// ========================================

// General error handlers with toast support
export * from "./error-manager";

// Core error handling utilities (safe operations)
export { 
  safeJsonParse, 
  safeDataExtraction, 
  getUserFriendlyErrorMessage 
} from "./error-handler";

// ========================================
// API-SPECIFIC ERROR HANDLING
// ========================================

// API error handling with HTTP status code support
export { 
  handleApiError as handleHttpApiError,
  isNetworkError,
  formatApiErrorForUser,
  ApiErrorDetails
} from "../../network/api/error-interceptor";
export * from "../../../auth/token-debug";

// ========================================
// LOGGING UTILITIES
// ========================================

/**
 * Log error with context information
 * @param context - Context string describing where the error occurred
 * @param error - Error object or message
 */
export const logErrorWithContext = (context: string, error: any): void => {
  logger.error(`[${context}]`, error);
};
