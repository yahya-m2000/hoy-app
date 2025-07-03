/**
 * Host Policy Service
 * 
 * Manages host policy operations including:
 * - Policy setup for new hosts
 * - Policy updates and modifications
 * - Refund calculations based on cancellation policies
 * - Setup validation and status checking
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "@core/utils/sys/log";
import { HostPoliciesService } from "./management.service";
import type {
  HostPolicies,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  SetupFormData,
} from "@core/types/host.types";

/**
 * Time validation regex for 24-hour format
 */
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Default policy values
 */
const DEFAULT_POLICIES = {
  REFUND_PERIOD_DAYS: 14,
  FULL_REFUND_DAYS: 7,
  PARTIAL_REFUND_DAYS: 3,
  NO_REFUND_DAYS: 1,
  CHECK_IN_TIME: "15:00",
  CHECK_OUT_TIME: "11:00",
  QUIET_HOURS_START: "22:00",
  QUIET_HOURS_END: "08:00",
} as const;

/**
 * Host Policy Management Service
 * Provides business logic for host policy operations
 * 
 * @class HostPolicyService
 */
export class HostPolicyService {
  /**
   * Get host policies with error handling
   * 
   * @returns Promise<HostPolicies | null> - Host policies or null if not found
   * @throws Error if API call fails
   */
  static async getHostPolicies(): Promise<HostPolicies | null> {
    try {
      const response = await HostPoliciesService.getHostPolicies();
      return response.data || null;
    } catch (error) {
      logger.error("Failed to fetch host policies:", error);
      throw error;
    }
  }

  /**
   * Setup host policies for new hosts
   * 
   * @param data - Complete policy setup request data
   * @returns Promise<HostPolicies> - Created host policies
   * @throws Error if setup fails
   */
  static async setupHostPolicies(
    data: HostPoliciesSetupRequest
  ): Promise<HostPolicies> {
    try {
      logger.log(
        "HostPolicyService.setupHostPolicies called with:",
        JSON.stringify(data, null, 2)
      );
      const response = await HostPoliciesService.setupHostPolicies(data);
      logger.log("API response:", response);
      return response.data;
    } catch (error: any) {
      logger.error("Failed to setup host policies:", error);
      logger.error("Error details:", JSON.stringify(error, null, 2));
      if (error.response) {
        logger.error("Response status:", error.response.status);
        logger.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  /**
   * Update existing host policies
   * 
   * @param data - Partial policy update request data
   * @returns Promise<HostPolicies> - Updated host policies
   * @throws Error if update fails
   */
  static async updateHostPolicies(
    data: HostPoliciesUpdateRequest
  ): Promise<HostPolicies> {
    try {
      const response = await HostPoliciesService.updateHostPolicies(data);
      return response.data;
    } catch (error) {
      logger.error("Failed to update host policies:", error);
      throw error;
    }
  }

  /**
   * Calculate refund amount based on cancellation policy
   * 
   * @param bookingId - ID of the booking to calculate refund for
   * @param totalAmount - Total booking amount
   * @returns Promise with refund calculation details
   * @throws Error if calculation fails
   */
  static async calculateRefund(bookingId: string, totalAmount: number) {
    try {
      // Get booking details to extract check-in date
      const { BookingService } = await import('../booking/booking.service');
      const booking = await BookingService.getBookingById(bookingId);
      
      const response = await HostPoliciesService.calculateRefund({
        bookingId,
        checkInDate: booking.checkIn,
        totalAmount,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to calculate refund:", error);
      throw error;
    }
  }

  /**
   * Get default policies template for new hosts
   * 
   * @returns Promise<HostPolicies> - Default policy template
   * @throws Error if API call fails
   */
  static async getDefaultPolicies(): Promise<HostPolicies> {
    try {
      const response = await HostPoliciesService.getDefaultPolicies();
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch default policies:", error);
      throw error;
    }
  }

  /**
   * Check host setup completion status
   * 
   * @returns Promise with setup status and completed steps
   * @throws Error if status check fails
   */
  static async checkSetupStatus(): Promise<{
    isSetupComplete: boolean;
    completedSteps: string[];
  }> {
    try {
      const response = await HostPoliciesService.checkHostSetupStatus();
      return response.data;
    } catch (error) {
      logger.error("Failed to check setup status:", error);
      throw error;
    }
  }

  /**
   * Validate setup form data
   * 
   * @param data - Form data to validate
   * @returns Validation result with errors if any
   */
  static validateSetupData(data: SetupFormData): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    logger.log(
      "HostPolicyService.validateSetupData called with:",
      JSON.stringify(data, null, 2)
    );
    const errors: Record<string, string> = {};

    // Validate cancellation policy
    if (data.cancellationPolicy) {
      const {
        refundPeriodDays,
        fullRefundDays,
        partialRefundDays,
        noRefundDays,
      } = data.cancellationPolicy;

      if (refundPeriodDays !== undefined && refundPeriodDays < 0) {
        errors.refundPeriodDays = "Refund period must be 0 or more days";
      }

      if (fullRefundDays !== undefined && fullRefundDays < 0) {
        errors.fullRefundDays = "Full refund days must be 0 or more";
      }

      if (partialRefundDays !== undefined && partialRefundDays < 0) {
        errors.partialRefundDays = "Partial refund days must be 0 or more";
      }

      if (noRefundDays !== undefined && noRefundDays < 0) {
        errors.noRefundDays = "No refund days must be 0 or more";
      }
    }

    // Validate house rules
    if (data.houseRules) {
      const { checkInTime, checkOutTime, quietHours } = data.houseRules;
      logger.log(
        "Checking times - checkIn:",
        checkInTime,
        "checkOut:",
        checkOutTime
      );

      // Time validation re-enabled
      if (checkInTime && !this.isValidTime(checkInTime)) {
        errors.checkInTime = "Please enter a valid check-in time";
        logger.log("Invalid check-in time:", checkInTime);
      }

      if (checkOutTime && !this.isValidTime(checkOutTime)) {
        errors.checkOutTime = "Please enter a valid check-out time";
        logger.log("Invalid check-out time:", checkOutTime);
      }

      if (quietHours?.enabled) {
        if (!quietHours.start || !this.isValidTime(quietHours.start)) {
          errors.quietHoursStart = "Please enter a valid quiet hours start time";
          logger.log("Invalid quiet hours start:", quietHours.start);
        }
        if (!quietHours.end || !this.isValidTime(quietHours.end)) {
          errors.quietHoursEnd = "Please enter a valid quiet hours end time";
          logger.log("Invalid quiet hours end:", quietHours.end);
        }
      }
    }

    const result = {
      isValid: Object.keys(errors).length === 0,
      errors,
    };

    logger.log("Validation complete. Result:", result);
    return result;
  }

  /**
   * Create complete setup request from form data
   * Fills in default values for any missing fields
   * 
   * @param data - Partial form data
   * @returns Complete setup request with defaults
   */
  static createSetupRequest(data: SetupFormData): HostPoliciesSetupRequest {
    return {
      cancellationPolicy: {
        refundPeriodDays: data.cancellationPolicy.refundPeriodDays || DEFAULT_POLICIES.REFUND_PERIOD_DAYS,
        fullRefundDays: data.cancellationPolicy.fullRefundDays || DEFAULT_POLICIES.FULL_REFUND_DAYS,
        partialRefundDays: data.cancellationPolicy.partialRefundDays || DEFAULT_POLICIES.PARTIAL_REFUND_DAYS,
        noRefundDays: data.cancellationPolicy.noRefundDays || DEFAULT_POLICIES.NO_REFUND_DAYS,
        strictPolicy: data.cancellationPolicy.strictPolicy || false,
      },
      houseRules: {
        checkInTime: data.houseRules.checkInTime || DEFAULT_POLICIES.CHECK_IN_TIME,
        checkOutTime: data.houseRules.checkOutTime || DEFAULT_POLICIES.CHECK_OUT_TIME,
        smokingAllowed: data.houseRules.smokingAllowed || false,
        petsAllowed: data.houseRules.petsAllowed || false,
        partiesAllowed: data.houseRules.partiesAllowed || false,
        quietHours: {
          enabled: data.houseRules.quietHours?.enabled || false,
          start: data.houseRules.quietHours?.start || DEFAULT_POLICIES.QUIET_HOURS_START,
          end: data.houseRules.quietHours?.end || DEFAULT_POLICIES.QUIET_HOURS_END,
        },
        additionalRules: data.houseRules.additionalRules || [],
      },
      safetyInformation: {
        smokeDetector: data.safetyInformation.smokeDetector || false,
        carbonMonoxideDetector: data.safetyInformation.carbonMonoxideDetector || false,
        fireExtinguisher: data.safetyInformation.fireExtinguisher || false,
        firstAidKit: data.safetyInformation.firstAidKit || false,
        securityCamera: {
          present: data.safetyInformation.securityCamera?.present || false,
          location: data.safetyInformation.securityCamera?.location || "",
        },
        weaponsOnProperty: data.safetyInformation.weaponsOnProperty || false,
        dangerousAnimals: data.safetyInformation.dangerousAnimals || false,
        additionalSafety: data.safetyInformation.additionalSafety || [],
      },
      propertyInformation: {
        wifiNetwork: data.propertyInformation.wifiNetwork || "",
        wifiPassword: data.propertyInformation.wifiPassword || "",
        checkInInstructions: data.propertyInformation.checkInInstructions || "",
        keyLocation: data.propertyInformation.keyLocation || "",
        parkingInstructions: data.propertyInformation.parkingInstructions || "",
        amenities: data.propertyInformation.amenities || [],
        additionalNotes: data.propertyInformation.additionalNotes || "",
      },
    };
  }

  /**
   * Validate time format (HH:MM in 24-hour format)
   * 
   * @param time - Time string to validate
   * @returns boolean - true if valid format
   */
  private static isValidTime(time: string): boolean {
    const result = TIME_REGEX.test(time);
    logger.log(`Time validation: "${time}" -> ${result}`);
    return result;
  }
}

// Default export
export default HostPolicyService;
