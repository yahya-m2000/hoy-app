/**
 * Network Types
 * 
 * Comprehensive type definitions for network utilities including:
 * - Network information and connectivity states
 * - Network logging levels and configurations
 * - Network compatibility layer types
 * 
 * @module @core/types/network
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// NETWORK STATE TYPES
// ========================================

/**
 * Network information state interface
 * Compatible with @react-native-community/netinfo
 */
export interface NetInfoState {
  /** Network connection type (wifi, cellular, etc.) */
  type: string;
  /** Whether device is connected to internet */
  isConnected: boolean | null;
  /** Whether internet is reachable */
  isInternetReachable: boolean | null;
  /** Additional connection details */
  details: Record<string, unknown>;
}

/**
 * Network info state type alias for compatibility
 */
export type NetInfoStateType = NetInfoState;

// ========================================
// LOGGING TYPES
// ========================================

/**
 * Network logging levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Network log entry structure
 */
export interface NetworkLogEntry {
  /** Log timestamp in ISO format */
  timestamp: string;
  /** Log severity level */  
  level: LogLevel;
  /** Log message */
  message: string;
  /** Additional log details */
  details?: Record<string, string | number | boolean>;
}

// ========================================
// NETWORK UTILITY TYPES
// ========================================

/**
 * Network retry configuration
 */
export interface NetworkRetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
}

/**
 * Cache buster configuration
 */
export interface CacheBusterConfig {
  /** Whether cache busting is enabled */
  enabled: boolean;
  /** Query parameter name for cache busting */
  paramName: string;
  /** Cache bust strategy */
  strategy: "timestamp" | "random" | "version";
} 