/**
 * API Services
 * 
 * Consolidated exports for all business logic API services.
 * Services are organized by domain using namespace exports for better maintainability.
 * 
 * Usage:
 * import { auth, booking, host, property, user, review, search, wishlist, account } from '@core/api/services';
 * 
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// NAMESPACE EXPORTS BY DOMAIN
// ========================================

export * as auth from './auth';
export * as booking from './booking';
export * as host from './host';
export * as property from './property';
export * as user from './user';
export * as review from './review';
export * as search from './search';
export * as wishlist from './wishlist';
export * as account from './account';

// ========================================
// SERVICE CLASS EXPORTS
// ========================================

// Authentication Services
export { AuthService } from './auth';
export type { 
  RegisterData, 
  RegistrationResponse, 
  ResetPasswordData, 
  PasswordResetResponse 
} from './auth';

// Booking Services  
export { BookingService } from './booking';

// Host Services
export { 
  HostDashboardService,
  HostPropertyService, 
  HostReservationService,
  HostEarningsService,
  HostCalendarService,
  HostPolicyService,
  HostPoliciesService,
} from './host';
export type { 
  HostPropertyResponse,
  HostReservationResponse,
  HostEarningsResponse,
  HostDashboardResponse,
} from './host';

// Property Services
export { 
  PropertySearchService,
  PropertyDetailsService,
  PropertyPoliciesService,
  PropertyHostService,
  PropertyManagementService
} from './property';
export type { PropertyFilters, PropertyCoordinates, PropertyAvailability } from './property';

// User Services
export { UserService } from './user';
export type { 
  UserProfileData, 
  PasswordChangeData, 
  UserPreferences, 
  PaymentMethod 
} from './user';

// Review Services
export { ReviewService } from './review';
export type { Review, CreateReviewData, ReviewStats } from './review';

// Search Services  
export { SearchService } from './search';
export type { SearchFilters, LocationSuggestion, TrendingSearch, SearchResults } from './search';

// Wishlist Services
export { WishlistService } from './wishlist';
export type { 
  WishlistCollection, 
  CreateCollectionRequest, 
  UpdateCollectionRequest, 
  CollectionWithProperties, 
  WishlistItem 
} from './wishlist';

// ========================================
// LEGACY FUNCTION EXPORTS
// ========================================

// Auth functions (primary authentication methods)
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
  getCurrentUser  // Primary getCurrentUser function
} from './auth';

// Property functions
export {
  getProperties,
  getFeaturedProperties,
  searchProperties,
  getNearbyProperties,
  getPropertyById,
  getPropertyCalendar,
  getAvailableDates,
  getPropertyUnits,
  getUnitById,
  getPropertyReviews,
  getPropertyHostInfo,
  fetchPropertyHostInfo,
  getPublicHostProfile,
  // Property management functions
  getHostProperties,
  getHostProperty,
  uploadPropertyImages
} from './property';

// User functions (excluding getCurrentUser to avoid conflicts)
export {
  updateProfile,
  updatePassword,
  getUserById,
  getUserPreferences,
  updateUserPreferences,
  getPaymentMethods,
  addPaymentMethod,
} from './user';

// Host functions
export {
  getDashboardData,
  getAnalytics,
  getInsights,
  createProperty,
  updateProperty,
  deleteProperty,
  getReservations,
  getReservationDetails,
  updateReservationStatus,
  getEarnings,
  getPayouts,
} from './host';

// Search functions
export {
  searchPropertiesAdvanced,
  getLocationSuggestions,
  getNearbySearch,
  getTrendingSearches,
} from './search';