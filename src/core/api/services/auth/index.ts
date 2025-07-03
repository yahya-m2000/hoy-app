/**
 * Authentication Services
 * 
 * Centralized exports for all authentication-related services.
 * 
 * Service Classes:
 * - AuthService - Main authentication operations
 * 
 * @module @core/api/services/auth
 * @author Hoy Development Team
 * @version 2.0.0
 */

// Export service class
export { AuthService } from './auth.service';

// Export types and interfaces
export type {
  RegisterData,
  RegistrationResponse,
  ResetPasswordData,
  PasswordResetResponse,
} from './auth.service';

// Export legacy functions for backward compatibility
export {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  refreshTokens,
  getCurrentUser,
} from './auth.service';

// Re-export existing auth types for convenience
export type {
  LoginCredentials,
} from '@core/types/auth.types'; 