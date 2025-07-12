/**
 * Authentication Services
 * 
 * Centralized exports for all authentication-related utilities
 * 
 * @module @core/auth
 * @author Hoy Development Team  
 * @version 2.0.0
 */

// ========================================
// RE-EXPORT AUTH SERVICE
// ========================================

// Re-export the main auth service from API services
export { 
  AuthService,
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  refreshTokens,
  verifyEmail,
  changePassword
} from '@core/api/services/auth';

// ========================================
// CONTEXT AND HOOKS
// ========================================

export { AuthProvider, useAuth } from '../context/AuthContext';
export { useTokenRefresh, useAuthAction } from './hooks';

// ========================================
// COMPONENTS
// ========================================

export { LogoutHandler, AuthGuard, GuestGuard } from './components';
export type { AuthGuardProps, GuestGuardProps } from './components';

// ========================================
// UTILITIES
// ========================================

export { useAuthAction as useAuthPrompt } from './utils';
export { clearUserData } from './clear-user-data';

// Storage utilities
export {
  isAuthenticated,
  hasValidAuthentication,
  markTokensAsInvalid,
  clearTokenInvalidation,
  getTokenFromStorage,
  getRefreshTokenFromStorage,
  saveTokenToStorage,
  saveRefreshTokenToStorage,
  clearTokensFromStorage,
  setAuthStateChangeCallback
} from './storage';

// Secure Token Storage
export {
  secureTokenStorage,
  migrateTokensToSecureStorage,
  rotateTokenSecurity,
  validateTokenSecurity,
  getTokenStorageStats,
  updateSecureStorageConfig,
  getRecentStorageOperations,
  initializeSecureTokenStorage,
} from './secure-token-storage';

export type {
  SecureTokenStorageConfig,
  TokenStorageStats,
  TokenMigrationResult,
  TokenStorageOperation,
} from './secure-token-storage';

// Debug utilities  
export { getAuthDebugInfo, debugTokenStorage } from './debug';
export { clearAllAuthData } from './token-debug';
export { clearAllTokenDebugData } from './debug-tokens';

// ========================================
// TYPE RE-EXPORTS
// ========================================

export type {
  LoginCredentials,
  RegisterCredentials,
  PasswordResetCredentials,
  PasswordChangeCredentials,
  Tokens,
  TokenRefreshResponse,
  AuthUser,
  LoginResponse,
  RegisterResponse,
  PasswordResetResponse,
  EmailVerificationResponse,
  AuthContextType,
  AuthProviderProps,
  AuthActionOptions,
  TokenValidationResult,
  AuthStorageKeys,
  AuthFieldValidation,
  AuthFormState,
  AuthFormProps
} from '@core/types/auth.types';

// API Service types
export type {
  RegisterData,
  RegistrationResponse,
  ResetPasswordData,
  PasswordResetResponse as ApiPasswordResetResponse
} from '@core/api/services/auth';

// ========================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================

// Legacy debug exports (deprecated)
export { 
  getTokenDebugInfo as debugTokens, 
  simulateTokenExpiration, 
  forceLogout 
} from './token-debug';
export { 
  getTokenDebugInfo as debugTokenStorageLegacy,
  clearAllTokenDebugData as clearAllTokenDebugDataLegacy
} from './debug-tokens';

// Enhanced Logout
export * from './enhanced-logout';
