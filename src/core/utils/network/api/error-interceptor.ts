/**
 * API Error Handler Utilities
 *
 * Standardized API error handling to create consistent error messages,
 * logging, and user-friendly error formatting for HTTP/API requests.
 * 
 * @module @core/utils/error/api-error-handler
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { ApiErrorDetails } from '@core/types/api.types';

// Re-export for backward compatibility
export { ApiErrorDetails };

/**
 * Standardized API error handler to create consistent error messages and logging
 * @param error - The error from an API call
 * @param context - Optional context for where the error occurred (for logging)
 * @returns Structured error details
 */
export const handleApiError = (
  error: any,
  context: string = "API"
): ApiErrorDetails => {
  // Default error response
  const result: ApiErrorDetails = {
    message: "An unknown error occurred",
    isNetworkError: false,
    isServerError: false,
    originalError: error,
  };

  // Log error with context for debugging
  console.error(`${context} Error:`, error);

  if (!error) {
    return result;
  }

  // Handle Axios errors
  if (error.isAxiosError) {
    const axiosError = error;

    // Handle network errors (no response)
    if (!axiosError.response) {
      result.isNetworkError = true;
      result.message =
        "Unable to connect to the server. Please check your internet connection.";

      if (axiosError.code === "ECONNABORTED") {
        result.message = "Request timed out. Please try again.";
      }

      return result;
    }

    // We have a response with an error status
    result.status = axiosError.response.status;
    result.data = axiosError.response.data;

    // Handle common HTTP status codes
    switch (axiosError.response.status) {
      case 400:
        result.message = "Invalid request";
        if (axiosError.response.data?.message) {
          result.message = axiosError.response.data.message;
        }
        if (axiosError.response.data?.errors) {
          result.message +=
            ": " + JSON.stringify(axiosError.response.data.errors);
        }
        break;
      case 401:
        result.message = "Authentication required. Please log in again.";
        break;
      case 403:
        result.message = "You don't have permission to access this resource.";
        break;
      case 404:
        result.message = "The requested resource was not found.";
        break;
      case 422:
        result.message = "Validation error";
        if (axiosError.response.data?.message) {
          result.message = axiosError.response.data.message;
        }
        break;
      default:
        if (axiosError.response.status >= 500) {
          result.isServerError = true;
          result.message = "Server error. Please try again later.";
        } else {
          result.message =
            axiosError.response.data?.message ||
            axiosError.message ||
            `Error ${axiosError.response.status}`;
        }
    }

    return result;
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    result.message = error.message;

    // Check for network-related error messages
    if (
      error.message.includes("Network Error") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed")
    ) {
      result.isNetworkError = true;
      result.message =
        "Unable to connect to the server. Please check your internet connection.";
    }
  } else if (typeof error === "string") {
    result.message = error;
  }

  return result;
};

/**
 * Helper function to check if an error is a network error
 * @param error - The error to check
 * @returns true if the error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Check for axios network errors
  if (error.isAxiosError) {
    const axiosError = error;
    return !axiosError.response || axiosError.code === "ECONNABORTED";
  }

  // Check for error message patterns that indicate network issues
  if (error instanceof Error) {
    return (
      error.message.includes("Network Error") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed")
    );
  }

  return false;
};

/**
 * Formats API error for display to the user
 * @param error - The API error
 * @param fallbackMessage - Fallback message if no specific error is found
 * @returns User-friendly error message
 */
export const formatApiErrorForUser = (
  error: any,
  fallbackMessage: string = "Something went wrong. Please try again."
): string => {
  const errorDetails = handleApiError(error);

  // Return a user-friendly message
  if (errorDetails.isNetworkError) {
    return "Connection error. Please check your internet and try again.";
  }

  if (errorDetails.isServerError) {
    return "Our servers are experiencing issues. Please try again later.";
  }

  return errorDetails.message || fallbackMessage;
}; 