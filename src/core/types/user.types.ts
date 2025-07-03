/**
 * User Types
 * 
 * Comprehensive type definitions for user management including:
 * - User profiles and authentication
 * - Role-based access control
 * - Host-specific information
 * - User statistics and ratings
 * 
 * @module @core/types/user
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// USER ROLE TYPES
// ========================================

/**
 * Available user roles in the system
 */
export type UserRole = 'user' | 'host' | 'admin';

/**
 * Host type classification
 */
export type HostType = 'individual' | 'organization';

// ========================================
// CORE USER TYPES
// ========================================

/**
 * Core user interface with essential information
 */
export interface User {
  /** Primary user identifier */
  id: string;
  /** Legacy identifier for backward compatibility */
  _id?: string;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's role in the system */
  role: UserRole;
  /** Date when user joined the platform */
  joinedDate: string;
  /** Profile avatar URL */
  avatarUrl?: string;
  /** Alternative profile image field */
  profileImage?: string;
  /** Alternative profile picture field */
  profilePicture?: string;
  /** User's phone number */
  phoneNumber?: string;
}

/**
 * Extended user interface with additional profile information
 */
export interface ExtendedUser extends User {
  /** MongoDB-style ID */
  _id: string;
  /** Account creation timestamp */
  createdAt?: string;
  /** WhatsApp number for communication */
  whatsappNumber?: string;
  /** Alternative phone field */
  phone?: string;
  /** Type of host (for host users) */
  hostType?: HostType;
  /** Super host status */
  isSuperHost?: boolean;
  /** Host response rate percentage */
  responseRate?: string;
  /** Average response time */
  responseTime?: string;
  /** Number of properties owned */
  propertyCount?: number;
  /** Average rating across all properties */
  averageRating?: number;
  /** Number of reviews received */
  reviewCount?: number;
  /** Sum of all ratings across properties */
  totalRatingScore?: number;
  /** Total number of reviews across all properties */
  totalReviewCount?: number;
}

// ========================================
// USER PROFILE TYPES
// ========================================

/**
 * User profile information for editing
 */
export interface UserProfile {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's phone number */
  phoneNumber?: string;
  /** User's WhatsApp number */
  whatsappNumber?: string;
  /** Profile image URL */
  profileImage?: string;
  /** User's bio/description */
  bio?: string;
  /** User's date of birth */
  dateOfBirth?: string;
  /** User's gender */
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  /** User's preferred language */
  preferredLanguage?: string;
  /** User's preferred currency */
  preferredCurrency?: string;
}

/**
 * User profile update request
 */
export interface UserProfileUpdateRequest extends Partial<UserProfile> {
  /** Current password for verification */
  currentPassword?: string;
}

// ========================================
// HOST-SPECIFIC TYPES
// ========================================

/**
 * Host preferences interface
 */
export interface HostPreferences {
  /** Notification preferences */
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  /** Booking preferences */
  booking: {
    instantBooking: boolean;
    requireApproval: boolean;
    minimumStay: number;
    maximumStay: number;
  };
  /** Communication preferences */
  communication: {
    language: string;
    timezone: string;
    responseTime: number;
  };
  /** Pricing preferences */
  pricing: {
    currency: string;
    dynamicPricing: boolean;
    weekendPremium: number;
  };
}

/**
 * Host-specific user information
 */
export interface HostUser extends ExtendedUser {
  /** Host type is required for hosts */
  hostType: HostType;
  /** Host verification status */
  isVerified: boolean;
  /** Host rating statistics */
  hostStats: HostStats;
  /** Host preferences */
  hostPreferences: HostPreferences;
}

/**
 * Host statistics and performance metrics
 */
export interface HostStats {
  /** Total number of bookings */
  totalBookings: number;
  /** Total revenue generated */
  totalRevenue: number;
  /** Average rating received */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Response rate percentage */
  responseRate: number;
  /** Average response time in hours */
  responseTimeHours: number;
  /** Acceptance rate percentage */
  acceptanceRate: number;
  /** Cancellation rate percentage */
  cancellationRate: number;
}



// ========================================
// USER SEARCH & FILTER TYPES
// ========================================

/**
 * User search parameters
 */
export interface UserSearchParams {
  /** Search query */
  query?: string;
  /** Filter by role */
  role?: UserRole;
  /** Filter by host type */
  hostType?: HostType;
  /** Filter by verification status */
  isVerified?: boolean;
  /** Filter by super host status */
  isSuperHost?: boolean;
  /** Minimum rating filter */
  minRating?: number;
  /** Sort by field */
  sortBy?: 'joinedDate' | 'rating' | 'responseRate' | 'reviewCount';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * User list item for search results
 */
export interface UserListItem {
  /** User ID */
  id: string;
  /** Full name */
  fullName: string;
  /** Email address */
  email: string;
  /** Profile image URL */
  profileImage?: string;
  /** User role */
  role: UserRole;
  /** Join date */
  joinedDate: string;
  /** Rating (for hosts) */
  rating?: number;
  /** Review count (for hosts) */
  reviewCount?: number;
  /** Super host status */
  isSuperHost?: boolean;
}

// ========================================
// UTILITY USER TYPES
// ========================================

/**
 * Simplified user interface for utility functions
 * Used in user display name, initials, and greeting utilities
 */
export interface UtilityUser {
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's email address */
  email?: string;
  /** User's display name */
  displayName?: string;
}
