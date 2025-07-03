/**
 * Earnings Types
 * 
 * Comprehensive type definitions for earnings and financial management including:
 * - Transaction tracking and history
 * - Earnings summaries and analytics
 * - Payout methods and processing
 * - Financial reporting and charts
 * 
 * @module @core/types/earnings
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// TRANSACTION TYPES
// ========================================

/**
 * Transaction type categories
 */
export type TransactionType = 'payout' | 'earning' | 'refund' | 'fee' | 'adjustment' | 'bonus';

/**
 * Transaction status options
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing' | 'cancelled';

/**
 * Individual transaction record
 */
export interface Transaction extends BaseEntity {
  /** Transaction date */
  date: string;
  /** Transaction amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Type of transaction */
  type: TransactionType;
  /** Current status */
  status: TransactionStatus;
  /** Associated property ID */
  propertyId?: string;
  /** Property title for reference */
  propertyTitle?: string;
  /** Associated reservation ID */
  reservationId?: string;
  /** Transaction description */
  description?: string;
  /** Payment method used */
  paymentMethod?: string;
  /** Platform fee amount */
  platformFee?: number;
  /** Net amount after fees */
  netAmount?: number;
  /** Transaction reference number */
  referenceNumber?: string;
  /** Processing fee amount */
  processingFee?: number;
  /** Tax amount */
  taxAmount?: number;
}

// ========================================
// EARNINGS SUMMARY TYPES
// ========================================

/**
 * Earnings summary breakdown
 */
export interface EarningsSummary {
  /** Total lifetime earnings */
  totalEarnings: number;
  /** Pending payout amount */
  pendingPayouts: number;
  /** Completed payout amount */
  completedPayouts: number;
  /** Total platform fees paid */
  totalFees: number;
  /** Net earnings after all deductions */
  netEarnings: number;
  /** Average monthly earnings */
  averageMonthlyEarnings?: number;
  /** Year-to-date earnings */
  yearToDateEarnings?: number;
  /** Last 30 days earnings */
  last30DaysEarnings?: number;
  /** Growth percentage compared to previous period */
  growthPercentage?: number;
}

// ========================================
// CHART DATA TYPES
// ========================================

/**
 * Chart data for earnings visualization
 */
export interface EarningsChartData {
  /** Time period labels (dates, months, etc.) */
  labels: string[];
  /** Earnings amounts for each period */
  earnings: number[];
  /** Occupancy rates for each period */
  occupancyRates: number[];
  /** Booking counts for each period */
  bookingCounts?: number[];
  /** Average daily rates */
  averageDailyRates?: number[];
}

/**
 * Detailed analytics data for charts and reports
 */
export interface EarningsAnalytics extends EarningsChartData {
  /** Monthly breakdown */
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    bookings: number;
    averageRate: number;
    occupancyRate: number;
  }>;
  /** Property performance comparison */
  propertyPerformance: Array<{
    propertyId: string;
    propertyTitle: string;
    earnings: number;
    bookings: number;
    rating: number;
    occupancyRate: number;
  }>;
  /** Seasonal trends */
  seasonalTrends: Array<{
    period: string;
    averageEarnings: number;
    peakDays: string[];
    recommendedPricing?: number;
  }>;
}

// ========================================
// PAYOUT METHOD TYPES
// ========================================

/**
 * Payout method types
 */
export type PayoutMethodType = 'bank' | 'paypal' | 'venmo' | 'stripe' | 'other';

/**
 * Payout method configuration
 */
export interface PayoutMethod extends BaseEntity {
  /** Method type */
  type: PayoutMethodType;
  /** Display name for the method */
  name: string;
  /** Whether this is the default method */
  isDefault: boolean;
  /** Last four digits of account */
  lastFour?: string;
  /** Account holder name */
  accountHolderName?: string;
  /** Account status */
  status?: 'active' | 'inactive' | 'pending_verification' | 'suspended';
  /** Verification status */
  isVerified?: boolean;
  /** Method-specific details */
  details?: {
    bankName?: string;
    accountType?: string;
    routingNumber?: string;
    email?: string;
    username?: string;
  };
  /** Next payout date for this method */
  nextPayoutDate?: string;
  /** Minimum payout amount */
  minimumAmount?: number;
  /** Processing time in days */
  processingDays?: number;
}

// ========================================
// COMPLETE EARNINGS DATA TYPE
// ========================================

/**
 * Complete earnings data structure
 */
export interface EarningsData {
  /** Earnings summary */
  summary: EarningsSummary;
  /** Chart visualization data */
  chartData: EarningsChartData;
  /** Transaction history */
  transactions: Transaction[];
  /** Available payout methods */
  payoutMethods: PayoutMethod[];
  /** Detailed analytics */
  analytics?: EarningsAnalytics;
  /** Last updated timestamp */
  lastUpdated?: string;
  /** Currency for all amounts */
  baseCurrency?: string;
}

// ========================================
// FILTER & SEARCH TYPES
// ========================================

/**
 * Earnings filter options
 */
export interface EarningsFilter {
  /** Start date for filtering */
  startDate?: string;
  /** End date for filtering */
  endDate?: string;
  /** Transaction type filter */
  transactionType?: TransactionType | 'all';
  /** Status filter */
  status?: TransactionStatus | 'all';
  /** Property filter */
  propertyId?: string;
  /** Currency filter */
  currency?: string;
  /** Minimum amount filter */
  minAmount?: number;
  /** Maximum amount filter */
  maxAmount?: number;
}

/**
 * Earnings search parameters
 */
export interface EarningsSearchParams extends EarningsFilter {
  /** Search query */
  query?: string;
  /** Sort field */
  sortBy?: 'date' | 'amount' | 'type' | 'status';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Results per page */
  limit?: number;
  /** Page offset */
  offset?: number;
}

// ========================================
// REPORT TYPES
// ========================================

/**
 * Earnings report configuration
 */
export interface EarningsReportConfig {
  /** Report time period */
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  /** Custom start date (if period is custom) */
  startDate?: string;
  /** Custom end date (if period is custom) */
  endDate?: string;
  /** Properties to include */
  propertyIds?: string[];
  /** Report format */
  format: 'pdf' | 'csv' | 'excel' | 'json';
  /** Include transaction details */
  includeTransactions?: boolean;
  /** Include charts */
  includeCharts?: boolean;
  /** Report language */
  language?: string;
  /** Currency for report */
  currency?: string;
}

/**
 * Generated earnings report
 */
export interface EarningsReport {
  /** Report ID */
  id: string;
  /** Report configuration used */
  config: EarningsReportConfig;
  /** Report generation status */
  status: 'generating' | 'completed' | 'failed';
  /** Download URL (when completed) */
  downloadUrl?: string;
  /** Report file size */
  fileSize?: number;
  /** Generation timestamp */
  generatedAt?: string;
  /** Expiration timestamp */
  expiresAt?: string;
  /** Error message (if failed) */
  error?: string;
}

// ========================================
// PAYOUT REQUEST TYPES
// ========================================

/**
 * Payout request data
 */
export interface PayoutRequest {
  /** Amount to withdraw */
  amount: number;
  /** Currency */
  currency: string;
  /** Payout method ID */
  payoutMethodId: string;
  /** Optional notes */
  notes?: string;
  /** Expected processing date */
  expectedDate?: string;
}

/**
 * Payout request status
 */
export interface PayoutStatus {
  /** Request ID */
  id: string;
  /** Current status */
  status: 'submitted' | 'processing' | 'completed' | 'failed' | 'cancelled';
  /** Requested amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Request submission date */
  submittedAt: string;
  /** Expected completion date */
  expectedCompletionDate?: string;
  /** Actual completion date */
  completedAt?: string;
  /** Processing fee */
  processingFee?: number;
  /** Net amount after fees */
  netAmount?: number;
  /** Error message (if failed) */
  errorMessage?: string;
  /** Tracking information */
  trackingInfo?: string;
}
