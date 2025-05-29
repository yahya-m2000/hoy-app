/**
 * Error handling utilities for the Hoy application
 * Provides consistent error formatting and handling
 */

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Format error helper for consistent error handling
 * @param error The error object to format
 * @param defaultMessage Default message if no message can be extracted from the error
 * @returns Formatted Error object
 */
export const formatError = (error: any, defaultMessage: string): Error => {
  // Enhanced error debugging
  console.log("Formatting error:", {
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
 * Prepare toast content from an error
 * @param error The error object
 * @param defaultMessage Default message to show if no message can be extracted
 * @returns Toast properties for showing an error toast
 */
export const errorToast = (
  error: any,
  defaultMessage: string
): ToastOptions => {
  const message = formatError(error, defaultMessage).message;

  return {
    type: "error",
    message,
  };
};

/**
 * Log an error with additional context
 * @param error The error object
 * @param context Additional context about where the error occurred
 */
export const logError = (error: any, context: string): void => {
  console.error(`[${context}] Error:`, error);

  // Here you could add additional logging like sending to a monitoring service
};

/**
 * Handle an API error consistently
 * @param error The error from an API call
 * @param context Context where the error occurred
 * @param defaultMessage Default message if no message can be extracted
 * @param showToast Function to show a toast notification (optional)
 * @returns Formatted error message
 */
export const handleApiError = (
  error: any,
  context: string,
  defaultMessage: string,
  showToast?: (toast: ToastOptions) => void
): string => {
  logError(error, context);
  const formattedError = formatError(error, defaultMessage);

  if (showToast) {
    showToast({
      type: "error",
      message: formattedError.message,
    });
  }

  return formattedError.message;
};
