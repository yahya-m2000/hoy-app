/**
 * Debug Components
 * 
 * Collection of debug and monitoring components for development and testing.
 * 
 * @module @shared/components/debug
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// MONITORING COMPONENTS
// ========================================

// Memory monitoring
export { MemoryMonitor } from './MemoryMonitor';
export { MemoryLeakMonitor } from './MemoryLeakMonitor';

// Error monitoring
export { ErrorMonitor } from './ErrorMonitor';

// API monitoring
export { CircuitBreakerMonitor } from './CircuitBreakerMonitor';
export { RequestSigningDebug } from './RequestSigningDebug';

// ========================================
// DEBUG COMPONENTS
// ========================================

// Currency system
export { CurrencyDebug } from './CurrencyDebug';

// Token validation
export { TokenValidationDebug } from './TokenValidationDebug';
export { default as TokenDebugScreen } from './TokenDebugScreen';

// Retry mechanism
export { RetryMechanismDebug } from './RetryMechanismDebug';

// Error boundaries
export { ErrorBoundaryDebug } from './ErrorBoundaryDebug';

// Certificate pinning
export { CertificatePinningDebug } from './CertificatePinningDebug';

// Token Storage Security Debug
export { TokenStorageSecurityDebug } from './TokenStorageSecurityDebug';

// API Key Management Debug
export { ApiKeyManagementDebug } from './ApiKeyManagementDebug';

// ========================================
// ERROR BOUNDARIES
// ========================================

export { default as NavigationErrorBoundary } from './NavigationErrorBoundary';
export { default as TextErrorBoundary } from './TextErrorBoundary';

// ========================================
// SHARED UTILITIES
// ========================================

// Export shared styles
export { debugStyles } from './styles';
