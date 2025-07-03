/**
 * Context Error Boundary
 *
 * Specialized error boundary for React Context providers that:
 * - Prevents context errors from crashing the entire app
 * - Provides context-specific fallback states
 * - Maintains app functionality when individual contexts fail
 * - Offers recovery options for context reinitialization
 * - Logs context-specific error information
 *
 * @module @core/error/ContextErrorBoundary
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { logger } from "@core/utils/sys/log";
import { eventEmitter } from "@core/utils/sys/event-emitter";

// ========================================
// TYPES & INTERFACES
// ========================================

interface ContextErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, contextName: string) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  showErrorUI?: boolean;
  critical?: boolean; // If true, will crash the app instead of showing fallback
}

// ========================================
// CONTEXT ERROR CLASSIFICATION
// ========================================

enum ContextErrorType {
  INITIALIZATION_ERROR = "initialization_error",
  STATE_UPDATE_ERROR = "state_update_error",
  ASYNC_OPERATION_ERROR = "async_operation_error",
  STORAGE_ERROR = "storage_error",
  NETWORK_ERROR = "network_error",
  PERMISSION_ERROR = "permission_error",
  UNKNOWN_ERROR = "unknown_error",
}

const classifyContextError = (
  error: Error,
  contextName: string
): ContextErrorType => {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  // Check for initialization errors
  if (
    message.includes("cannot read properties") ||
    message.includes("undefined") ||
    message.includes("null") ||
    stack.includes("constructor") ||
    stack.includes("useeffect")
  ) {
    return ContextErrorType.INITIALIZATION_ERROR;
  }

  // Check for state update errors
  if (
    message.includes("cannot update") ||
    message.includes("state") ||
    message.includes("setstate") ||
    stack.includes("setstate")
  ) {
    return ContextErrorType.STATE_UPDATE_ERROR;
  }

  // Check for async operation errors
  if (
    message.includes("promise") ||
    message.includes("async") ||
    message.includes("await") ||
    stack.includes("async")
  ) {
    return ContextErrorType.ASYNC_OPERATION_ERROR;
  }

  // Check for storage errors
  if (
    message.includes("asyncstorage") ||
    message.includes("storage") ||
    message.includes("securestore") ||
    contextName.toLowerCase().includes("storage")
  ) {
    return ContextErrorType.STORAGE_ERROR;
  }

  // Check for network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    contextName.toLowerCase().includes("network")
  ) {
    return ContextErrorType.NETWORK_ERROR;
  }

  // Check for permission errors
  if (
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("access denied")
  ) {
    return ContextErrorType.PERMISSION_ERROR;
  }

  return ContextErrorType.UNKNOWN_ERROR;
};

// ========================================
// CONTEXT ERROR BOUNDARY COMPONENT
// ========================================

export class ContextErrorBoundary extends Component<
  ContextErrorBoundaryProps,
  ContextErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private readonly defaultMaxRetries = 3;
  private readonly retryDelay = 2000;

  constructor(props: ContextErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ContextErrorBoundaryState> {
    const errorId = `context_error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { contextName, onError, critical = false } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Classify the error
    const errorType = classifyContextError(error, contextName);

    // Log context-specific error
    this.logContextError(error, errorInfo, errorType);

    // Emit context error event
    eventEmitter.emit("error:context", {
      error,
      errorInfo,
      contextName,
      errorType,
      errorId: this.state.errorId,
      critical,
    });

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo, contextName);
      } catch (handlerError) {
        logger.error(
          `[ContextErrorBoundary] Error in custom error handler for ${contextName}:`,
          handlerError
        );
      }
    }

    // If critical context, crash the app
    if (critical) {
      logger.error(
        `[ContextErrorBoundary] Critical context ${contextName} failed - app will crash`,
        { error: error.message, errorType }
      );
      throw error; // Re-throw to crash the app
    }

    // Report to analytics in production
    if (!__DEV__) {
      this.reportContextErrorToAnalytics(error, errorType);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Log context-specific error details
   */
  private logContextError = (
    error: Error,
    errorInfo: ErrorInfo,
    errorType: ContextErrorType
  ): void => {
    const { contextName } = this.props;

    logger.error(
      `[ContextErrorBoundary] ${contextName} context error (${errorType}):`,
      {
        contextName,
        errorType,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        retryCount: this.state.retryCount,
        module: "ContextErrorBoundary",
      }
    );

    // Enhanced logging in development
    if (__DEV__) {
      console.group(`🔴 Context Error: ${contextName}`);
      console.error("Error Type:", errorType);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  };

  /**
   * Report context error to analytics
   */
  private reportContextErrorToAnalytics = (
    error: Error,
    errorType: ContextErrorType
  ): void => {
    try {
      const { contextName } = this.props;

      // In production, this would send to analytics service
      logger.info(
        `[ContextErrorBoundary] Context error reported to analytics`,
        {
          contextName,
          errorType,
          errorId: this.state.errorId,
          module: "ContextErrorBoundary",
        }
      );
    } catch (reportError) {
      logger.error(
        "[ContextErrorBoundary] Failed to report context error to analytics:",
        reportError
      );
    }
  };

  /**
   * Retry context initialization
   */
  private handleRetry = (): void => {
    const { maxRetries = this.defaultMaxRetries, contextName } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      Alert.alert(
        "Context Recovery Failed",
        `The ${contextName} context has failed multiple times. Some features may not work correctly.`,
        [
          { text: "Continue", style: "default" },
          {
            text: "Restart App",
            onPress: this.handleAppRestart,
            style: "destructive",
          },
        ]
      );
      return;
    }

    logger.info(
      `[ContextErrorBoundary] Retrying ${contextName} context (attempt ${
        retryCount + 1
      }/${maxRetries})`
    );

    // Add delay to prevent rapid retry loops
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1,
      });
    }, this.retryDelay);
  };

  /**
   * Reset context error boundary
   */
  private handleReset = (): void => {
    const { contextName } = this.props;

    logger.info(
      `[ContextErrorBoundary] Resetting ${contextName} context error boundary`
    );

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
    });
  };

  /**
   * Handle app restart request
   */
  private handleAppRestart = (): void => {
    const { contextName } = this.props;

    logger.info(
      `[ContextErrorBoundary] App restart requested due to ${contextName} context failure`
    );

    eventEmitter.emit("app:restart_requested", {
      reason: "context_error",
      contextName,
      errorId: this.state.errorId,
    });

    Alert.alert(
      "App Restart Required",
      "Please close and reopen the app to restore full functionality.",
      [{ text: "OK", style: "default" }]
    );
  };

  /**
   * Get context-specific error message
   */
  private getContextErrorMessage = (error: Error): string => {
    const { contextName } = this.props;
    const errorType = classifyContextError(error, contextName);

    switch (errorType) {
      case ContextErrorType.INITIALIZATION_ERROR:
        return `Failed to initialize ${contextName}. Some features may not work correctly.`;
      case ContextErrorType.STATE_UPDATE_ERROR:
        return `${contextName} state update failed. Data may not be current.`;
      case ContextErrorType.ASYNC_OPERATION_ERROR:
        return `${contextName} background operation failed. Please try again.`;
      case ContextErrorType.STORAGE_ERROR:
        return `${contextName} storage access failed. Settings may not be saved.`;
      case ContextErrorType.NETWORK_ERROR:
        return `${contextName} network operation failed. Check your connection.`;
      case ContextErrorType.PERMISSION_ERROR:
        return `${contextName} permission denied. Check app permissions.`;
      default:
        return `${contextName} encountered an unexpected error.`;
    }
  };

  /**
   * Render fallback UI for context errors
   */
  private renderContextFallback = (): ReactNode => {
    const {
      contextName,
      fallbackComponent,
      enableRetry = true,
      showErrorUI = true,
      maxRetries = this.defaultMaxRetries,
    } = this.props;
    const { error, retryCount, errorId } = this.state;

    if (!error) return null;

    // Use custom fallback component if provided
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Don't show error UI if disabled
    if (!showErrorUI) {
      return null;
    }

    const errorMessage = this.getContextErrorMessage(error);
    const canRetry = enableRetry && retryCount < maxRetries;

    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Context Error</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>

          {__DEV__ && errorId && (
            <Text style={styles.errorId}>Error ID: {errorId}</Text>
          )}

          <View style={styles.buttonContainer}>
            {canRetry && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
              >
                <Text style={styles.retryButtonText}>
                  Retry {retryCount > 0 && `(${maxRetries - retryCount} left)`}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={this.handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Context: {contextName}</Text>
              <Text style={styles.debugText}>
                Retries: {retryCount}/{maxRetries}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  render(): ReactNode {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return this.renderContextFallback();
    }

    return children;
  }
}

// ========================================
// CONVENIENCE COMPONENTS
// ========================================

/**
 * Auth Context Error Boundary
 */
export const AuthContextErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Authentication"
    critical={true} // Auth is critical - app should crash if it fails
    enableRetry={true}
    maxRetries={2}
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * Network Context Error Boundary
 */
export const NetworkContextErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Network"
    critical={false}
    enableRetry={true}
    maxRetries={3}
    fallbackComponent={
      <View style={styles.networkFallback}>
        <Text style={styles.fallbackText}>Network monitoring unavailable</Text>
      </View>
    }
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * Theme Context Error Boundary
 */
export const ThemeContextErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Theme"
    critical={false}
    enableRetry={true}
    maxRetries={2}
    showErrorUI={false} // Theme errors shouldn't show UI
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * Currency Context Error Boundary
 */
export const CurrencyContextErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ContextErrorBoundary
    contextName="Currency"
    critical={false}
    enableRetry={true}
    maxRetries={3}
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * Toast Context Error Boundary
 */
export const ToastContextErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Toast"
    critical={false}
    enableRetry={true}
    maxRetries={2}
    showErrorUI={false} // Toast errors shouldn't show UI
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * User Role Context Error Boundary
 */
export const UserRoleContextErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ContextErrorBoundary
    contextName="UserRole"
    critical={false}
    enableRetry={true}
    maxRetries={2}
  >
    {children}
  </ContextErrorBoundary>
);

/**
 * Generic Context Error Boundary
 */
export const GenericContextErrorBoundary: React.FC<{
  children: ReactNode;
  contextName: string;
  critical?: boolean;
  fallback?: ReactNode;
}> = ({ children, contextName, critical = false, fallback }) => (
  <ContextErrorBoundary
    contextName={contextName}
    critical={critical}
    enableRetry={true}
    maxRetries={3}
    fallbackComponent={fallback}
  >
    {children}
  </ContextErrorBoundary>
);

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    padding: 15,
  },
  errorContent: {
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  errorId: {
    fontSize: 10,
    color: "#6c757d",
    fontFamily: "monospace",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButton: {
    backgroundColor: "#007bff",
  },
  resetButton: {
    backgroundColor: "#6c757d",
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  debugInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: "#6c757d",
    fontFamily: "monospace",
  },
  networkFallback: {
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    margin: 5,
  },
  fallbackText: {
    fontSize: 12,
    color: "#1976d2",
    textAlign: "center",
  },
});
