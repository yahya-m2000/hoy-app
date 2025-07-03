/**
 * Error Handling Utilities
 *
 * Core error handling functions for data validation, 
 * safe operations, and error recovery mechanisms.
 * 
 * @module @core/utils/error/error-handling
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../log";

/**
 * Format error helper for consistent error handling
 * @param error The error object to format
 * @param defaultMessage Default message if no message can be extracted from the error
 * @returns Formatted Error object
 */
export const formatError = (error: any, defaultMessage: string): Error => {
  // Enhanced error debugging
  logger.log("Formatting error:", {
    errorType: error?.constructor?.name,
    hasResponse: !!error?.response,
    hasData: !!error?.response?.data,
    status: error?.response?.status,
  });

  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return new Error(error.response.data.message);
    }
    if (error.response.data.error) {
      return new Error(error.response.data.error);
    }
    // Handle validation errors that might include details
    if (Array.isArray(error.response.data)) {
      return new Error(
        `Validation errors: ${JSON.stringify(error.response.data)}`
      );
    }
  }

  if (error.message) {
    return new Error(error.message);
  }

  return new Error(defaultMessage);
};

/**
 * Safely parse JSON data with error handling
 * @param jsonString JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed JSON data or default value
 */
export const safeJsonParse = <T = any>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn("Failed to parse JSON:", error);
    return defaultValue;
  }
};

/**
 * Safely extract data from response with type checking
 * @param data Response data to extract from
 * @param path Dot notation path to extract (e.g., "user.profile.name")
 * @param defaultValue Default value if extraction fails
 * @returns Extracted data or default value
 */
export const safeDataExtraction = <T = any>(
  data: any,
  path: string,
  defaultValue: T
): T => {
  try {
    const keys = path.split('.');
    let result = data;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    logger.warn("Failed to extract data from path:", path, { module: 'ErrorHandler' });
    return defaultValue;
  }
};

/**
 * Get a user-friendly error message from any error type
 * @param error Error object or string
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && error?.data && typeof error.data === 'string') return error.data;
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}; 