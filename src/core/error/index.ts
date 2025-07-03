/**
 * Error Handling System - Index
 * 
 * Central export point for all error handling components, services, and utilities.
 * 
 * @module @core/error
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Error Boundaries
export {
  default as GlobalErrorBoundary,
  AppErrorBoundary,
  ScreenErrorBoundary,
  ComponentErrorBoundary,
  useErrorHandler,
} from './GlobalErrorBoundary';

// Context Error Boundaries
export {
  ContextErrorBoundary,
  AuthContextErrorBoundary,
  NetworkContextErrorBoundary,
  ThemeContextErrorBoundary,
  CurrencyContextErrorBoundary,
  ToastContextErrorBoundary,
  UserRoleContextErrorBoundary,
  GenericContextErrorBoundary,
} from './ContextErrorBoundary';

// Error Reporting Service
export {
  default as errorReportingService,
  reportError,
  reportFatalError,
  reportWarning,
  ErrorType,
  ErrorLevel,
} from '../api/services/error/error-reporting.service';

export type {
  ErrorReport,
  ErrorMetrics,
} from '../api/services/error/error-reporting.service'; 