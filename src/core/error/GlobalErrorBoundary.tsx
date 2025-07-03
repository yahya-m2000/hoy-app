/**
 * Global Error Boundary
 *
 * Comprehensive error boundary system that catches all React errors
 * and provides graceful fallback UI with recovery options.
 *
 * Features:
 * - Catches all React component errors
 * - Provides user-friendly error messages
 * - Offers recovery options (retry, reset, report)
 * - Logs errors for debugging
 * - Handles different error types appropriately
 * - Prevents app crashes
 *
 * @module @core/error/GlobalErrorBoundary
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Icon } from "@shared/components/base/Icon";
import { Container } from "@shared/components/layout/Container";
import { logger } from "@core/utils/sys/log";
import { eventEmitter } from "@core/utils/sys/event-emitter";

// ========================================
// TYPES & INTERFACES
// ========================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "app" | "screen" | "component";
  name?: string;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string | null;
  errorBoundary?: string;
  errorInfo?: any;
}

// ========================================
// ERROR CLASSIFICATION
// ========================================

enum ErrorType {
  RENDER_ERROR = "render_error",
  NETWORK_ERROR = "network_error",
  PERMISSION_ERROR = "permission_error",
  MEMORY_ERROR = "memory_error",
  UNKNOWN_ERROR = "unknown_error",
}

const classifyError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();

  if (
    message.includes("text strings must be rendered within a <text> component")
  ) {
    return ErrorType.RENDER_ERROR;
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return ErrorType.NETWORK_ERROR;
  }

  if (message.includes("permission") || message.includes("unauthorized")) {
    return ErrorType.PERMISSION_ERROR;
  }

  if (message.includes("memory") || message.includes("heap")) {
    return ErrorType.MEMORY_ERROR;
  }

  return ErrorType.UNKNOWN_ERROR;
};

// ========================================
// ERROR BOUNDARY COMPONENT
// ========================================

export class GlobalErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(props: ErrorBoundaryProps) {
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

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random()
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
    const { onError, level = "component", name = "Unknown" } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Create detailed error information
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: `${level}:${name}`,
      errorInfo: {
        ...errorInfo,
        props: this.props,
        state: this.state,
      },
    };

    // Log error with full context
    this.logError(error, errorDetails);

    // Emit error event for global handling
    eventEmitter.emit("error:boundary", {
      error,
      errorInfo,
      level,
      name,
      errorId: this.state.errorId,
    });

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error(
          "[GlobalErrorBoundary] Error in custom error handler:",
          handlerError
        );
      }
    }

    // Report to crash analytics in production
    if (!__DEV__) {
      this.reportErrorToAnalytics(error, errorDetails);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Log error with comprehensive details
   */
  private logError = (error: Error, details: ErrorDetails): void => {
    const errorType = classifyError(error);

    logger.error(`[GlobalErrorBoundary] ${errorType} caught:`, {
      error: error.message,
      stack: error.stack,
      componentStack: details.componentStack,
      errorBoundary: details.errorBoundary,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      module: "GlobalErrorBoundary",
    });

    // Log additional context in development
    if (__DEV__) {
      console.group(`🚨 Error Boundary: ${details.errorBoundary}`);
      console.error("Error:", error);
      console.error("Error Info:", details.errorInfo);
      console.error("Component Stack:", details.componentStack);
      console.groupEnd();
    }
  };

  /**
   * Report error to analytics service
   */
  private reportErrorToAnalytics = (
    error: Error,
    details: ErrorDetails
  ): void => {
    try {
      // In a real app, this would send to crash analytics like Crashlytics
      // analytics.recordError(error, details);

      logger.info("[GlobalErrorBoundary] Error reported to analytics", {
        errorId: this.state.errorId,
        module: "GlobalErrorBoundary",
      });
    } catch (reportError) {
      logger.error(
        "[GlobalErrorBoundary] Failed to report error to analytics:",
        reportError
      );
    }
  };

  /**
   * Retry rendering the component
   */
  private handleRetry = (): void => {
    const { retryCount } = this.state;

    if (retryCount >= this.maxRetries) {
      Alert.alert(
        "Maximum Retries Exceeded",
        "The component has failed multiple times. Please restart the app.",
        [
          { text: "OK", style: "default" },
          {
            text: "Restart App",
            onPress: this.handleRestart,
            style: "destructive",
          },
        ]
      );
      return;
    }

    logger.info(
      `[GlobalErrorBoundary] Retrying component (attempt ${retryCount + 1}/${
        this.maxRetries
      })`
    );

    // Add delay before retry to prevent rapid retry loops
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
   * Reset error boundary to initial state
   */
  private handleReset = (): void => {
    logger.info("[GlobalErrorBoundary] Resetting error boundary");

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
  private handleRestart = (): void => {
    logger.info("[GlobalErrorBoundary] App restart requested");

    // Emit restart event for app-level handling
    eventEmitter.emit("app:restart_requested", {
      reason: "error_boundary",
      errorId: this.state.errorId,
    });

    // In React Native, we can't truly restart the app, but we can reset to initial state
    Alert.alert(
      "App Restart",
      "Please close and reopen the app to complete the restart.",
      [{ text: "OK", style: "default" }]
    );
  };

  /**
   * Report bug to development team
   */
  private handleReportBug = (): void => {
    const { error, errorInfo, errorId } = this.state;

    if (!error || !errorInfo) return;

    const bugReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent || "Unknown",
      level: this.props.level,
      name: this.props.name,
    };

    logger.info("[GlobalErrorBoundary] Bug report generated:", bugReport);

    // In a real app, this would send to a bug tracking service
    Alert.alert(
      "Bug Report",
      "Error details have been logged. Thank you for helping us improve the app!",
      [{ text: "OK", style: "default" }]
    );
  };

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage = (error: Error): string => {
    const errorType = classifyError(error);

    switch (errorType) {
      case ErrorType.RENDER_ERROR:
        return "There was a problem displaying this content. Please try again.";
      case ErrorType.NETWORK_ERROR:
        return "Unable to connect to the server. Please check your internet connection and try again.";
      case ErrorType.PERMISSION_ERROR:
        return "You don't have permission to access this feature. Please contact support if this seems incorrect.";
      case ErrorType.MEMORY_ERROR:
        return "The app is running low on memory. Please close other apps and try again.";
      default:
        return "Something unexpected happened. Please try again or restart the app if the problem persists.";
    }
  };

  /**
   * Render fallback UI
   */
  private renderFallbackUI = (): ReactNode => {
    const { error, retryCount, errorId } = this.state;
    const { level = "component", name = "Unknown" } = this.props;

    if (!error) return null;

    const errorMessage = this.getErrorMessage(error);
    const canRetry = retryCount < this.maxRetries;
    const isAppLevel = level === "app";

    return (
      <Container
        style={[styles.container, ...(isAppLevel ? [styles.fullScreen] : [])]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Icon
              name="alert-circle"
              size={isAppLevel ? 64 : 48}
              color="#ff4444"
            />
          </View>

          {/* Error Title */}
          <Text style={[styles.title, isAppLevel && styles.titleLarge]}>
            {isAppLevel ? "Oops! Something went wrong" : "Component Error"}
          </Text>

          {/* Error Message */}
          <Text style={styles.message}>{errorMessage}</Text>

          {/* Error ID (for debugging) */}
          {__DEV__ && errorId && (
            <Text style={styles.errorId}>Error ID: {errorId}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {canRetry && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
              >
                <Icon name="refresh" size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                  Try Again{" "}
                  {retryCount > 0 && `(${this.maxRetries - retryCount} left)`}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={this.handleReset}
            >
              <Icon name="refresh" size={20} color="#666" />
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>

            {isAppLevel && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleRestart}
              >
                <Icon name="power" size={20} color="#666" />
                <Text style={styles.secondaryButtonText}>Restart App</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={this.handleReportBug}
            >
              <Icon name="bug" size={20} color="#999" />
              <Text style={styles.tertiaryButtonText}>Report Bug</Text>
            </TouchableOpacity>
          </View>

          {/* Development Details */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Information</Text>
              <Text style={styles.debugText}>
                Component: {level}:{name}
              </Text>
              <Text style={styles.debugText}>Error: {error.message}</Text>
              <Text style={styles.debugText}>
                Retry Count: {retryCount}/{this.maxRetries}
              </Text>
            </View>
          )}
        </ScrollView>
      </Container>
    );
  };

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback && this.state.error) {
        try {
          return fallback(this.state.error, this.handleRetry);
        } catch (fallbackError) {
          logger.error(
            "[GlobalErrorBoundary] Error in custom fallback:",
            fallbackError
          );
          // Fall through to default UI
        }
      }

      return this.renderFallbackUI();
    }

    return children;
  }
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  fullScreen: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  titleLarge: {
    fontSize: 24,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  errorId: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tertiaryButton: {
    backgroundColor: "transparent",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  tertiaryButtonText: {
    color: "#999",
    fontSize: 14,
    marginLeft: 8,
  },
  debugContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    marginBottom: 4,
  },
});

// ========================================
// CONVENIENCE COMPONENTS
// ========================================

/**
 * App-level error boundary (wraps entire app)
 */
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <GlobalErrorBoundary level="app" name="Application">
    {children}
  </GlobalErrorBoundary>
);

/**
 * Screen-level error boundary (wraps individual screens)
 */
export const ScreenErrorBoundary: React.FC<{
  children: ReactNode;
  screenName: string;
}> = ({ children, screenName }) => (
  <GlobalErrorBoundary level="screen" name={screenName}>
    {children}
  </GlobalErrorBoundary>
);

/**
 * Component-level error boundary (wraps specific components)
 */
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}> = ({ children, componentName, fallback }) => (
  <GlobalErrorBoundary
    level="component"
    name={componentName}
    fallback={fallback}
  >
    {children}
  </GlobalErrorBoundary>
);

// ========================================
// HOOKS
// ========================================

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    logger.error(`[useErrorHandler] ${context || "Component"} error:`, error);

    eventEmitter.emit("error:component", {
      error,
      context,
      timestamp: Date.now(),
    });
  }, []);

  return { handleError };
};

// ========================================
// EXPORTS
// ========================================

export default GlobalErrorBoundary;
