/**
 * Host Policies Types
 * Type definitions for host policy management
 */

export interface CancellationPolicy {
  refundPeriodDays: number; // e.g., 14 days before booking
  fullRefundDays: number; // e.g., 7 days full refund
  partialRefundDays: number; // e.g., 3 days 50% refund
  noRefundDays: number; // e.g., 1 day no refund
  strictPolicy: boolean; // If true, applies stricter rules
}

export interface HouseRules {
  checkInTime: string; // e.g., "3:00 PM"
  checkOutTime: string; // e.g., "11:00 AM"
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  additionalRules: string[];
}

export interface SafetyInformation {
  smokeDetector: boolean;
  carbonMonoxideDetector: boolean;
  fireExtinguisher: boolean;
  firstAidKit: boolean;
  securityCamera: {
    present: boolean;
    location: string;
  };
  weaponsOnProperty: boolean;
  dangerousAnimals: boolean;
  additionalSafety: string[];
}

export interface PropertyInformation {
  wifiNetwork?: string;
  wifiPassword?: string;
  checkInInstructions?: string;
  keyLocation?: string;
  parkingInstructions?: string;
  amenities: string[];
  additionalNotes?: string;
}

export interface HostPolicies {
  cancellationPolicy: CancellationPolicy;
  houseRules: HouseRules;
  safetyInformation: SafetyInformation;
  propertyInformation: PropertyInformation;
  isSetup: boolean;
  setupCompletedAt?: Date;
}

export interface HostSetupStep {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  data?: any;
}

export interface SetupFormData {
  cancellationPolicy: Partial<CancellationPolicy>;
  houseRules: Partial<HouseRules>;
  safetyInformation: Partial<SafetyInformation>;
  propertyInformation: Partial<PropertyInformation>;
}

export interface CancellationRefundDetails {
  eligibleForRefund: boolean;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  daysUntilCheckIn: number;
  totalAmount: number;
}

export interface CancellationCalculation {
  policy: CancellationPolicy;
  refundDetails: CancellationRefundDetails;
}

// API Response types
export interface HostPoliciesResponse {
  success: boolean;
  data: {
    hostPolicies: HostPolicies | null;
  };
}

export interface SetupStatusResponse {
  success: boolean;
  data: {
    isSetup: boolean;
    setupCompletedAt?: Date;
    requiresSetup: boolean;
  };
}

// API Request types
export interface HostPoliciesSetupRequest {
  cancellationPolicy: CancellationPolicy;
  houseRules: HouseRules;
  safetyInformation: SafetyInformation;
  propertyInformation: PropertyInformation;
}

export interface HostPoliciesUpdateRequest {
  cancellationPolicy?: Partial<CancellationPolicy>;
  houseRules?: Partial<HouseRules>;
  safetyInformation?: Partial<SafetyInformation>;
  propertyInformation?: Partial<PropertyInformation>;
}

export interface RefundCalculationRequest {
  bookingId: string;
  checkInDate: string;
  totalAmount: number;
}

export interface RefundCalculationResponse {
  eligibleForRefund: boolean;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  daysUntilCheckIn: number;
  totalAmount: number;
  policyDetails: {
    refundPeriodDays: number;
    fullRefundDays: number;
    partialRefundDays: number;
    noRefundDays: number;
  };
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
