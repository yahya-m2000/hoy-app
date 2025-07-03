/**
 * Host Dashboard Types
 * 
 * Comprehensive type definitions for host dashboard interface including:
 * - Dashboard overview and statistics
 * - Recent reservations and reviews
 * - Property performance metrics
 * - Earnings and payout information
 * 
 * @module @core/types/host-dashboard
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// DASHBOARD STATISTICS TYPES
// ========================================

/**
 * Core dashboard statistics
 */
export interface DashboardStats {
  /** Total number of properties */
  totalProperties: number;
  /** Number of active properties */
  activeProperties: number;
  /** Total reservations count */
  totalReservations: number;
  /** Pending reservations count */
  pendingReservations: number;
  /** Total earnings amount */
  totalEarnings: number;
  /** Pending payout amount */
  pendingPayouts: number;
  /** Average rating across all properties */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Overall occupancy rate percentage */
  occupancyRate: number;
}

/**
 * Properties statistics with array-like interface for compatibility
 */
export interface PropertiesStats {
  /** Total properties count */
  total?: number;
  /** Active properties count */
  active?: number;
  /** Inactive properties count */
  inactive?: number;
  /** Average occupancy rate */
  occupancyRate?: number;
  /** Array length for compatibility */
  length?: number;
  /** Filter method for array-like behavior */
  filter?: <T>(fn: (p: T) => boolean) => T[];
  /** Reduce method for array-like behavior */
  reduce?: <T, R>(fn: (sum: R, p: T) => R, initial: R) => R;
}

/**
 * Earnings overview breakdown
 */
export interface EarningsOverview {
  /** Today's earnings */
  today: number;
  /** This week's earnings */
  thisWeek: number;
  /** This month's earnings */
  thisMonth: number;
  /** This year's earnings */
  thisYear: number;
  /** Previous month's earnings */
  lastMonth?: number;
  /** Year-to-date earnings */
  yearToDate?: number;
  /** Upcoming earnings */
  upcoming?: number;
}

// ========================================
// RESERVATION TYPES
// ========================================

/**
 * Recent reservation item for dashboard display
 */
export interface RecentReservation extends BaseEntity {
  /** Guest's full name */
  guestName: string;
  /** Guest's profile photo URL */
  guestPhoto?: string;
  /** Associated property ID */
  propertyId: string;
  /** Property title/name */
  propertyTitle: string;
  /** Property main image URL */
  propertyImage?: string;
  /** Check-in date */
  checkIn: string;
  /** Check-out date */
  checkOut: string;
  /** Total booking amount */
  totalAmount: number;
  /** Reservation status */
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  /** Reservation creation date */
  createdAt: string;
  /** Number of guests */
  guests?: number;
}

// ========================================
// REVIEW TYPES
// ========================================

/**
 * Recent review item for dashboard display
 */
export interface RecentReview extends BaseEntity {
  /** Guest's full name */
  guestName: string;
  /** Guest's profile photo URL */
  guestPhoto?: string;
  /** Associated property ID */
  propertyId: string;
  /** Property title/name */
  propertyTitle: string;
  /** Review rating (1-5) */
  rating: number;
  /** Review comment/content */
  comment: string;
  /** Review creation date */
  createdAt: string;
  /** Whether review has been responded to */
  hasResponse?: boolean;
  /** Review language */
  language?: string;
}

// ========================================
// PROPERTY PERFORMANCE TYPES
// ========================================

/**
 * Popular property performance metrics
 */
export interface PopularProperty extends BaseEntity {
  /** Property title/name */
  title: string;
  /** Property location */
  location: string;
  /** Property main image URL */
  image: string;
  /** Average rating */
  rating: number;
  /** Total review count */
  reviewCount: number;
  /** Occupancy rate percentage */
  occupancyRate: number;
  /** Total bookings count */
  totalBookings?: number;
  /** Total revenue generated */
  totalRevenue?: number;
  /** Average daily rate */
  averageDailyRate?: number;
}

// ========================================
// PAYOUT TYPES
// ========================================

/**
 * Upcoming payout information
 */
export interface UpcomingPayout extends BaseEntity {
  /** Payout amount */
  amount: number;
  /** Expected payout date */
  date: string;
  /** Payout status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Currency code */
  currency?: string;
  /** Payout method */
  payoutMethod?: string;
  /** Associated reservations */
  reservations?: string[];
  /** Processing fee */
  processingFee?: number;
}

// ========================================
// COMPLETE DASHBOARD TYPE
// ========================================

/**
 * Complete host dashboard data structure
 */
export interface HostDashboard {
  // Legacy direct access properties for backward compatibility
  /** Total earnings (legacy) */
  totalEarnings?: number;
  /** Pending payouts (legacy) */
  pendingPayouts?: number;
  /** This month earnings (legacy) */
  thisMonth?: number;
  /** Last month earnings (legacy) */
  lastMonth?: number;

  /** Properties section with array-like interface */
  properties?: PropertiesStats;

  /** Earnings section breakdown */
  earnings?: EarningsOverview;

  /** Core dashboard statistics */
  stats: DashboardStats;

  /** Recent reservations list */
  recentReservations: RecentReservation[];

  /** Recent reviews list */
  recentReviews: RecentReview[];

  /** Popular properties performance */
  popularProperties: PopularProperty[];

  /** Earnings overview by period */
  earningsOverview: EarningsOverview;

  /** Upcoming payouts list */
  upcomingPayouts: UpcomingPayout[];

  /** Dashboard data last updated timestamp */
  lastUpdated?: string;

  /** Whether data is still loading */
  isLoading?: boolean;

  /** Any error in loading dashboard data */
  error?: string | null;
}

// ========================================
// DASHBOARD FILTER & SEARCH TYPES
// ========================================

/**
 * Dashboard date range filter
 */
export interface DashboardDateRange {
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
  /** Preset range type */
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  /** Date range filter */
  dateRange?: DashboardDateRange;
  /** Property filter */
  propertyIds?: string[];
  /** Status filter for reservations */
  reservationStatus?: ('pending' | 'confirmed' | 'cancelled' | 'completed')[];
  /** Currency filter */
  currency?: string;
  /** Include cancelled bookings */
  includeCancelled?: boolean;
}

/**
 * Dashboard refresh options
 */
export interface DashboardRefreshOptions {
  /** Whether to force refresh from server */
  forceRefresh?: boolean;
  /** Specific sections to refresh */
  sections?: ('stats' | 'reservations' | 'reviews' | 'properties' | 'earnings' | 'payouts')[];
  /** Show loading state during refresh */
  showLoading?: boolean;
}
