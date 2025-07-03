/**
 * Host Management Types
 * 
 * Comprehensive type definitions for host management including:
 * - Host policies and configurations
 * - Property rules and safety information
 * - Cancellation policies and refunds
 * - Host setup and onboarding
 * 
 * @module @core/types/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// CANCELLATION POLICY TYPES
// ========================================

/**
 * Cancellation policy configuration
 */
export interface CancellationPolicy {
  /** Refund period before booking (in days) */
  refundPeriodDays: number;
  /** Full refund period (in days) */
  fullRefundDays: number;
  /** Partial refund period (in days) */
  partialRefundDays: number;
  /** No refund period (in days) */
  noRefundDays: number;
  /** Whether to apply strict policy rules */
  strictPolicy: boolean;
  /** Partial refund percentage */
  partialRefundPercentage?: number;
  /** Service fee refund policy */
  serviceFeeRefundable?: boolean;
}

/**
 * Cancellation refund calculation details
 */
export interface CancellationRefundDetails {
  /** Whether eligible for any refund */
  eligibleForRefund: boolean;
  /** Refund percentage (0-100) */
  refundPercentage: number;
  /** Actual refund amount */
  refundAmount: number;
  /** Cancellation fee amount */
  cancellationFee: number;
  /** Days until check-in */
  daysUntilCheckIn: number;
  /** Total booking amount */
  totalAmount: number;
  /** Refund breakdown */
  breakdown?: {
    accommodation: number;
    serviceFee: number;
    taxes: number;
  };
}

/**
 * Complete cancellation calculation result
 */
export interface CancellationCalculation {
  /** Applied policy */
  policy: CancellationPolicy;
  /** Refund details */
  refundDetails: CancellationRefundDetails;
}

// ========================================
// HOUSE RULES TYPES
// ========================================

/**
 * Quiet hours configuration
 */
export interface QuietHours {
  /** Whether quiet hours are enabled */
  enabled: boolean;
  /** Start time (24-hour format) */
  start: string;
  /** End time (24-hour format) */
  end: string;
}

/**
 * House rules configuration
 */
export interface HouseRules {
  /** Check-in time (e.g., "3:00 PM") */
  checkInTime: string;
  /** Check-out time (e.g., "11:00 AM") */
  checkOutTime: string;
  /** Whether smoking is allowed */
  smokingAllowed: boolean;
  /** Whether pets are allowed */
  petsAllowed: boolean;
  /** Whether parties/events are allowed */
  partiesAllowed: boolean;
  /** Quiet hours configuration */
  quietHours: QuietHours;
  /** Additional custom rules */
  additionalRules: string[];
  /** Maximum number of guests */
  maxGuests?: number;
  /** Minimum age requirement */
  minimumAge?: number;
  /** Whether commercial photography is allowed */
  commercialPhotography?: boolean;
}

// ========================================
// SAFETY INFORMATION TYPES
// ========================================

/**
 * Security camera configuration
 */
export interface SecurityCamera {
  /** Whether security cameras are present */
  present: boolean;
  /** Camera location description */
  location: string;
  /** Camera coverage areas */
  areas?: string[];
  /** Whether cameras record audio */
  recordsAudio?: boolean;
}

/**
 * Property safety information
 */
export interface SafetyInformation {
  /** Smoke detector availability */
  smokeDetector: boolean;
  /** Carbon monoxide detector availability */
  carbonMonoxideDetector: boolean;
  /** Fire extinguisher availability */
  fireExtinguisher: boolean;
  /** First aid kit availability */
  firstAidKit: boolean;
  /** Security camera information */
  securityCamera: SecurityCamera;
  /** Whether weapons are present on property */
  weaponsOnProperty: boolean;
  /** Whether dangerous animals are present */
  dangerousAnimals: boolean;
  /** Additional safety information */
  additionalSafety: string[];
  /** Emergency contact information */
  emergencyContact?: string;
  /** Medical facilities nearby */
  nearbyMedicalFacilities?: string[];
  /** Pool safety measures */
  poolSafety?: string[];
}

// ========================================
// PROPERTY INFORMATION TYPES
// ========================================

/**
 * WiFi network configuration
 */
export interface WiFiInfo {
  /** Network name/SSID */
  networkName: string;
  /** Network password */
  password: string;
  /** Whether guest network is available */
  guestNetwork?: boolean;
  /** Guest network credentials */
  guestCredentials?: {
    ssid: string;
    password: string;
  };
}

/**
 * Check-in instructions and property information
 */
export interface PropertyInformation {
  /** WiFi network name (legacy field) */
  wifiNetwork?: string;
  /** WiFi password (legacy field) */
  wifiPassword?: string;
  /** Complete WiFi information */
  wifi?: WiFiInfo;
  /** Detailed check-in instructions */
  checkInInstructions?: string;
  /** Key/access location details */
  keyLocation?: string;
  /** Parking instructions */
  parkingInstructions?: string;
  /** Available amenities */
  amenities: string[];
  /** Additional property notes */
  additionalNotes?: string;
  /** Emergency contact number */
  emergencyContact?: string;
  /** Local recommendations */
  localRecommendations?: string[];
  /** Transportation information */
  transportationInfo?: string[];
}

// ========================================
// HOST POLICIES AGGREGATE TYPE
// ========================================

/**
 * Complete host policies configuration
 */
export interface HostPolicies {
  /** Cancellation policy settings */
  cancellationPolicy: CancellationPolicy;
  /** House rules configuration */
  houseRules: HouseRules;
  /** Safety information */
  safetyInformation: SafetyInformation;
  /** Property information and instructions */
  propertyInformation: PropertyInformation;
  /** Whether setup is complete */
  isSetup: boolean;
  /** Setup completion timestamp */
  setupCompletedAt?: Date;
  /** Last updated timestamp */
  lastUpdated?: Date;
  /** Host ID who owns these policies */
  hostId?: string;
}

// ========================================
// HOST SETUP TYPES
// ========================================

/**
 * Host setup step configuration
 */
export interface HostSetupStep {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step subtitle/description */
  subtitle: string;
  /** Whether step is completed */
  completed: boolean;
  /** Step-specific data */
  data?: Record<string, unknown>;
  /** Step order */
  order?: number;
  /** Whether step is required */
  required?: boolean;
  /** Estimated time to complete */
  estimatedTime?: string;
}

/**
 * Form data for host setup process
 */
export interface SetupFormData {
  /** Partial cancellation policy data */
  cancellationPolicy: Partial<CancellationPolicy>;
  /** Partial house rules data */
  houseRules: Partial<HouseRules>;
  /** Partial safety information data */
  safetyInformation: Partial<SafetyInformation>;
  /** Partial property information data */
  propertyInformation: Partial<PropertyInformation>;
}

/**
 * Setup progress tracking
 */
export interface SetupProgress {
  /** Completed steps count */
  completedSteps: number;
  /** Total steps count */
  totalSteps: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Current step identifier */
  currentStep?: string;
  /** Estimated time remaining */
  estimatedTimeRemaining?: string;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

/**
 * Host policies API response
 */
export interface HostPoliciesResponse {
  /** Request success status */
  success: boolean;
  /** Response data */
  data: {
    /** Host policies configuration */
    hostPolicies: HostPolicies | null;
  };
  /** Response message */
  message?: string;
}

/**
 * Setup status API response
 */
export interface SetupStatusResponse {
  /** Request success status */
  success: boolean;
  /** Response data */
  data: {
    /** Whether setup is complete */
    isSetup: boolean;
    /** Setup completion timestamp */
    setupCompletedAt?: Date;
    /** Whether setup is required */
    requiresSetup: boolean;
    /** Setup progress information */
    progress?: SetupProgress;
  };
}

/**
 * Host policies setup request payload
 */
export interface HostPoliciesSetupRequest {
  /** Complete cancellation policy */
  cancellationPolicy: CancellationPolicy;
  /** Complete house rules */
  houseRules: HouseRules;
  /** Complete safety information */
  safetyInformation: SafetyInformation;
  /** Complete property information */
  propertyInformation: PropertyInformation;
}

/**
 * Host policies update request payload
 */
export interface HostPoliciesUpdateRequest {
  /** Partial cancellation policy updates */
  cancellationPolicy?: Partial<CancellationPolicy>;
  /** Partial house rules updates */
  houseRules?: Partial<HouseRules>;
  /** Partial safety information updates */
  safetyInformation?: Partial<SafetyInformation>;
  /** Partial property information updates */
  propertyInformation?: Partial<PropertyInformation>;
}

/**
 * Refund calculation request payload
 */
export interface RefundCalculationRequest {
  /** Booking ID to calculate refund for */
  bookingId: string;
  /** Check-in date */
  checkInDate: string;
  /** Total booking amount */
  totalAmount: number;
  /** Cancellation date (optional, defaults to now) */
  cancellationDate?: string;
}

/**
 * Refund calculation API response
 */
export interface RefundCalculationResponse {
  /** Whether eligible for refund */
  eligibleForRefund: boolean;
  /** Refund percentage */
  refundPercentage: number;
  /** Refund amount */
  refundAmount: number;
  /** Cancellation fee */
  cancellationFee: number;
  /** Days until check-in */
  daysUntilCheckIn: number;
  /** Total booking amount */
  totalAmount: number;
  /** Policy details used for calculation */
  policyDetails: {
    refundPeriodDays: number;
    fullRefundDays: number;
    partialRefundDays: number;
    noRefundDays: number;
  };
  /** Detailed breakdown */
  breakdown?: {
    accommodation: number;
    serviceFee: number;
    taxes: number;
  };
}

/**
 * Host notification preferences
 */
export interface HostNotificationPreferences {
  /** Email notifications enabled */
  email: boolean;
  /** Push notifications enabled */
  push: boolean;
  /** SMS notifications enabled */
  sms: boolean;
  /** Notification types to receive */
  types: {
    /** Booking notifications */
    bookings: boolean;
    /** Message notifications */
    messages: boolean;
    /** Review notifications */
    reviews: boolean;
    /** Payment notifications */
    payments: boolean;
    /** System notifications */
    system: boolean;
  };
}

/**
 * Host notification data structure
 */
export interface HostNotificationData {
  /** Notification ID */
  id: string;
  /** Notification type */
  type: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Associated booking ID */
  bookingId?: string;
  /** Associated property ID */
  propertyId?: string;
  /** Notification timestamp */
  timestamp: string;
  /** Whether notification is read */
  isRead: boolean;
  /** Additional notification data */
  data?: HostNotificationPreferences;
}
