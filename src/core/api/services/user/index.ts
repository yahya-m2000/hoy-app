/**
 * User Services
 * 
 * Centralized exports for all user-related services.
 * 
 * Service Classes:
 * - UserService - Main user profile and account operations
 * 
 * Note: getCurrentUser is available through AuthService to avoid conflicts.
 * Use AuthService.getCurrentUser() for authentication-related user data.
 * Use UserService.getCurrentUser() for detailed user profile operations.
 * 
 * @module @core/api/services/user
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Export service class and all its functions
export { UserService } from './user.service';

// Export types and interfaces
export type {
  UserProfileData,
  PasswordChangeData,
  UserPreferences,
  PaymentMethod,
} from './user.service';

// Export individual functions for backward compatibility
export {
  updateProfile,
  updatePassword,
  getUserById,
  getUserPreferences,
  updateUserPreferences,
  getPaymentMethods,
  addPaymentMethod,
} from './user.service'; 