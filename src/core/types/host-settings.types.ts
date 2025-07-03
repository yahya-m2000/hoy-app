/**
 * Host Settings Types
 * 
 * Comprehensive type definitions for host settings and configuration including:
 * - Host profile management
 * - Payment and payout settings
 * - Notification preferences
 * - Account verification status
 * 
 * @module @core/types/host-settings
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// VERIFICATION TYPES
// ========================================

/**
 * Host verification status for different categories
 */
export interface HostVerifications {
  /** Email verification status */
  email: boolean;
  /** Phone number verification status */
  phone: boolean;
  /** Identity document verification status */
  identity: boolean;
  /** Address verification status */
  address: boolean;
  /** Professional verification (for business hosts) */
  professional?: boolean;
  /** Background check status */
  backgroundCheck?: boolean;
}

// ========================================
// PAYMENT SETTINGS TYPES
// ========================================

/**
 * Payment method types available for payouts
 */
export type HostPayoutMethod = 'bank' | 'paypal' | 'venmo' | 'stripe' | 'other';

/**
 * Bank account details for payouts
 */
export interface BankAccountDetails {
  /** Account type (checking, savings) */
  type: string;
  /** Account number (masked) */
  accountNumber?: string;
  /** Bank routing number */
  routingNumber?: string;
  /** Account holder name */
  accountHolderName?: string;
  /** Bank name */
  bankName?: string;
  /** Bank address */
  bankAddress?: string;
  /** SWIFT code for international transfers */
  swiftCode?: string;
}

/**
 * PayPal account details
 */
export interface PayPalAccountDetails {
  /** PayPal email address */
  email: string;
  /** Account holder name */
  accountHolderName?: string;
  /** PayPal account ID */
  accountId?: string;
}

/**
 * Generic account details union type
 */
export type PayoutAccountDetails = BankAccountDetails | PayPalAccountDetails | {
  /** Account email for other services */
  email?: string;
  /** Account username */
  username?: string;
  /** Account holder name */
  accountHolderName?: string;
  /** Additional account information */
  [key: string]: string | number | boolean | undefined;
};

/**
 * Host payment and payout settings
 */
export interface PaymentSettings {
  /** Primary payout method */
  payoutMethod: HostPayoutMethod;
  /** Account details for the selected payout method */
  accountDetails: PayoutAccountDetails;
  /** Backup payout method */
  backupPayoutMethod?: HostPayoutMethod;
  /** Backup account details */
  backupAccountDetails?: PayoutAccountDetails;
  /** Tax information provided */
  taxInfoComplete?: boolean;
  /** Tax identification number */
  taxId?: string;
  /** Payout schedule preference */
  payoutSchedule?: 'weekly' | 'monthly' | 'manual';
  /** Minimum payout amount */
  minimumPayout?: number;
  /** Currency preference for payouts */
  payoutCurrency?: string;
}

// ========================================
// NOTIFICATION SETTINGS TYPES
// ========================================

/**
 * Host notification preferences
 */
export interface HostNotifications {
  /** Email notifications enabled */
  email: boolean;
  /** Push notifications enabled */
  push: boolean;
  /** SMS notifications enabled */
  sms: boolean;
  /** New booking notifications */
  newBookings: boolean;
  /** Booking update notifications */
  bookingUpdates: boolean;
  /** Guest message notifications */
  messages: boolean;
  /** Review notifications */
  reviews: boolean;
  /** Promotional notifications */
  promotions: boolean;
  /** Calendar synchronization notifications */
  calendarSync?: boolean;
  /** Price recommendation notifications */
  priceRecommendations?: boolean;
  /** Performance insights notifications */
  performanceInsights?: boolean;
}

// ========================================
// HOST PREFERENCES TYPES
// ========================================

/**
 * Host platform preferences and automation settings
 */
export interface HostPreferences {
  /** Preferred currency for display */
  currency: string;
  /** Preferred language */
  language: string;
  /** Timezone for scheduling */
  timezone: string;
  /** Instant booking enabled */
  instantBookingEnabled: boolean;
  /** Automatic review reminders */
  automaticReviewReminders: boolean;
  /** Automatic messaging enabled */
  automaticMessagingEnabled: boolean;
  /** Default check-in time */
  defaultCheckInTime?: string;
  /** Default check-out time */
  defaultCheckOutTime?: string;
  /** Automatic pricing enabled */
  automaticPricing?: boolean;
  /** Smart pricing enabled */
  smartPricing?: boolean;
  /** Professional hosting mode */
  professionalMode?: boolean;
}

// ========================================
// COMPLETE HOST SETTINGS TYPE
// ========================================

/**
 * Complete host settings configuration
 */
export interface HostSettings extends BaseEntity {
  /** Host user ID */
  userId: string;
  /** Public display name */
  displayName: string;
  /** Host bio/about section */
  about: string;
  /** Contact email address */
  email: string;
  /** Contact phone number */
  phone: string;
  /** Spoken languages */
  languages: string[];
  /** Response rate percentage */
  responseRate: number;
  /** Average response time */
  responseTime: string;
  /** Profile photo URL */
  profilePhoto: string;
  /** Verification status */
  verifications: HostVerifications;
  /** Payment and payout settings */
  paymentSettings: PaymentSettings;
  /** Notification preferences */
  notifications: HostNotifications;
  /** Platform preferences */
  preferences: HostPreferences;
  /** Host level/status */
  hostLevel?: 'new' | 'experienced' | 'superhost';
  /** Host since date */
  hostSince?: string;
  /** Professional host status */
  isProfessional?: boolean;
  /** Business license number */
  businessLicense?: string;
  /** Company name (for business hosts) */
  companyName?: string;
  /** Last settings update */
  lastUpdated?: string;
}

// ========================================
// SETTINGS UPDATE TYPES
// ========================================

/**
 * Host settings update request payload
 */
export interface HostSettingsUpdateRequest {
  /** Profile information updates */
  profile?: {
    displayName?: string;
    about?: string;
    phone?: string;
    languages?: string[];
    profilePhoto?: string;
  };
  /** Payment settings updates */
  paymentSettings?: Partial<PaymentSettings>;
  /** Notification preferences updates */
  notifications?: Partial<HostNotifications>;
  /** Platform preferences updates */
  preferences?: Partial<HostPreferences>;
  /** Business information updates */
  business?: {
    isProfessional?: boolean;
    businessLicense?: string;
    companyName?: string;
  };
}

/**
 * Settings validation result
 */
export interface SettingsValidation {
  /** Whether settings are valid */
  isValid: boolean;
  /** Validation errors by field */
  errors: Record<string, string[]>;
  /** Warnings for settings */
  warnings?: Record<string, string[]>;
  /** Completion percentage */
  completionPercentage: number;
  /** Missing required fields */
  missingFields: string[];
}
