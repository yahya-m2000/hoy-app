/**
 * Common utility for handling network errors consistently across the app
 */

/**
 * Determines if an error is a network-related error
 * @param error Any error object
 * @returns True if the error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check error message for network-related terms
  if (typeof error.message === 'string') {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    );
  }
  
  // Check for Axios-specific properties
  if (error.isAxiosError) {
    return !error.response || error.code === 'ECONNABORTED';
  }
  
  return false;
};

/**
 * Logs an error with reduced noise for network errors
 * @param context The context where the error occurred (e.g., "fetchUsers")
 * @param error The error object
 */
export const logErrorWithContext = (context: string, error: any): void => {
  if (isNetworkError(error)) {
    // For network errors, just log a simple message to reduce noise
    console.warn(`[${context}] Network error: Connection unavailable`);
  } else {
    // For other errors, log the full details
    console.error(`[${context}] Error:`, error);
  }
};

/**
 * Creates a user-friendly error message from an error object
 * @param error The error object
 * @param defaultMessage Default message to show if error can't be parsed
 * @returns User-friendly error message
 */
export const getFriendlyErrorMessage = (error: any, defaultMessage = "An error occurred"): string => {
  if (!error) return defaultMessage;
  
  // For network errors, provide a consistent message
  if (isNetworkError(error)) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  
  // Extract message from Axios error response if available
  if (error.isAxiosError && error.response?.data) {
    const { data } = error.response;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (typeof data === 'string') return data;
  }
  
  // Fall back to error.message or default
  return error.message || defaultMessage;
};
