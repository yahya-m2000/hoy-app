/**
 * Core Types
 * 
 * Centralized type definitions for the entire Hoy application.
 * All types are organized by domain for better maintainability and discoverability.
 * 
 * @module @core/types
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// FOUNDATION TYPES
// ========================================

// Core application and API types
export * from './api.types';
export * from './common.types';

// ========================================
// USER & AUTHENTICATION TYPES
// ========================================

// User management and authentication - specific exports to avoid HostPreferences conflict
export type {
  UserRole,
  HostType,
  User,
  ExtendedUser,
  UserProfile,
  UserProfileUpdateRequest,
  HostUser,
  HostStats,
  UserSearchParams,
  UserListItem,
  UtilityUser
} from './user.types';

export * from './account.types';

// ========================================
// BUSINESS DOMAIN TYPES
// ========================================

// Export property types (now includes component types from features/properties)
export * from './property.types';

// Export reservation types (now includes form types from features/properties) 
export * from './reservation.types';

// Export review types (now includes simple review types from features/properties)
export * from './review.types';

// Export feedback types for user feedback and support
export * from './feedback.types';

// ========================================
// BUSINESS DOMAIN TYPES CONTINUED
// ========================================

// Listings types - specific exports to avoid Property conflicts, rename conflicting types
export type {
  PropertyAddress as ListingAddress,
  PropertyCoordinates as ListingCoordinates,
  PropertyPermissions,
  RefundPercentage,
  CancellationPolicy as ListingCancellationPolicy,
  CheckTime,
  HouseRules as ListingHouseRules,
  SecurityCameras,
  SafetyFeatures as ListingSafetyFeatures,
  Host as ListingHost,
  Property as ListingProperty,
  PropertyFormData
} from './listings.types';

// Value exports (not types)
export { PROPERTY_TYPES, AMENITIES } from './listings.types';

// ========================================
// HOST MANAGEMENT TYPES
// ========================================

// Host types - specific exports to avoid CancellationPolicy and HouseRules conflicts with listings.types
export type {
  CancellationPolicy,
  CancellationPolicy as HostCancellationPolicy,
  CancellationRefundDetails,
  CancellationCalculation,
  QuietHours,
  HouseRules as HostHouseRules,
  SecurityCamera,
  SafetyInformation,
  WiFiInfo,
  PropertyInformation,
  HostPolicies,
  HostSetupStep,
  SetupFormData,
  SetupProgress,
  HostPoliciesResponse,
  SetupStatusResponse,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  RefundCalculationRequest,
  RefundCalculationResponse,
  HostNotificationPreferences,
  HostNotificationData
} from './host.types';

// Host settings - full export since this is the primary source for host settings
export * from './host-settings.types';

// Host dashboard
export * from './host-dashboard.types';

// Earnings
export * from './earnings.types';

// ========================================
// COMMUNICATION TYPES
// ========================================

// Messaging and notifications
export * from './chat.types';
export * from './message';

// ========================================
// LEGACY COMPATIBILITY EXPORTS
// ========================================

// Legacy exports for backward compatibility - specific exports to avoid PaymentMethod conflict
export type {
  BookingGuestInfo,
  BookingDates,
  BookingPriceDetails,
  BookingContactInfo,
  PaymentMethodDetails,
  PaymentMethod as BookingPaymentMethod,
  BookingFormData,
  BookingApiData,
  BookingAvailabilityParams,
  BookingPriceParams,
  BookingStepProps,
  BookingStep,
  BookingState,
  BookingStatus,
  BookingPaymentStatus,
  Booking,
  PopulatedBooking,
  HostBookingFilters,
  BookingsByDate,
  BookingDashboardStats,
  TodayBookings,
  DetailedBookingData,
  CalendarBookingData
} from './booking.types';

// Re-export key types with alternative names (avoiding conflicts)
export type {
  User as UserType,
  ExtendedUser as UserExtended,
  UserProfile as ProfileData
} from './user.types';

export type {
  ChatMessage as Message,
  ChatConversation as Conversation
} from './chat.types';

export type {
  Reservation as BookingReservation
} from './reservation.types';

export type {
  Transaction as EarningsTransaction,
  EarningsData as FinancialData
} from './earnings.types';

// ========================================
// UTILITY TYPES
// ========================================

// Network and connectivity types
export * from './network.types';

// Location and geographical types  
export * from './location.types';
