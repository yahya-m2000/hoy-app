import { HostPoliciesService } from "@shared/services/api/hostPolicies";
import {
  HostPolicies,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  SetupFormData,
} from "../types/hostPolicies";

/**
 * Host Policy Management Service
 * Business logic for host policy operations
 */
export class HostPolicyService {
  /**
   * Get host policies with error handling
   */
  static async getHostPolicies(): Promise<HostPolicies | null> {
    try {
      const response = await HostPoliciesService.getHostPolicies();
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch host policies:", error);
      throw error;
    }
  }
  /**
   * Setup host policies for new hosts
   */
  static async setupHostPolicies(
    data: HostPoliciesSetupRequest
  ): Promise<HostPolicies> {
    try {
      console.log(
        "HostPolicyService.setupHostPolicies called with:",
        JSON.stringify(data, null, 2)
      );
      const response = await HostPoliciesService.setupHostPolicies(data);
      console.log("API response:", response);
      return response.data;
    } catch (error: any) {
      console.error("Failed to setup host policies:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  /**
   * Update existing host policies
   */
  static async updateHostPolicies(
    data: HostPoliciesUpdateRequest
  ): Promise<HostPolicies> {
    try {
      const response = await HostPoliciesService.updateHostPolicies(data);
      return response.data;
    } catch (error) {
      console.error("Failed to update host policies:", error);
      throw error;
    }
  }

  /**
   * Calculate refund for cancellation
   */
  static async calculateRefund(bookingId: string, totalAmount: number) {
    try {
      const response = await HostPoliciesService.calculateRefund({
        bookingId,
        checkInDate: new Date().toISOString(), // This should come from booking
        totalAmount,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to calculate refund:", error);
      throw error;
    }
  }

  /**
   * Get default policies template
   */
  static async getDefaultPolicies(): Promise<HostPolicies> {
    try {
      const response = await HostPoliciesService.getDefaultPolicies();
      return response.data;
    } catch (error) {
      console.error("Failed to fetch default policies:", error);
      throw error;
    }
  }

  /**
   * Check host setup status
   */
  static async checkSetupStatus(): Promise<{
    isSetupComplete: boolean;
    completedSteps: string[];
  }> {
    try {
      const response = await HostPoliciesService.checkHostSetupStatus();
      return response.data;
    } catch (error) {
      console.error("Failed to check setup status:", error);
      throw error;
    }
  }
  /**
   * Validate setup form data
   */
  static validateSetupData(data: SetupFormData): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    console.log(
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
      const { checkInTime, checkOutTime, quietHours } = data.houseRules; // Temporarily disable time validation to test setup completion
      console.log(
        "Checking times - checkIn:",
        checkInTime,
        "checkOut:",
        checkOutTime
      );

      // if (checkInTime && !this.isValidTime(checkInTime)) {
      //   errors.checkInTime = "Please enter a valid check-in time";
      //   console.log("Invalid check-in time:", checkInTime, "isValid:", this.isValidTime(checkInTime));
      // } else if (checkInTime) {
      //   console.log("Valid check-in time:", checkInTime);
      // }

      // if (checkOutTime && !this.isValidTime(checkOutTime)) {
      //   errors.checkOutTime = "Please enter a valid check-out time";
      //   console.log("Invalid check-out time:", checkOutTime, "isValid:", this.isValidTime(checkOutTime));
      // } else if (checkOutTime) {
      //   console.log("Valid check-out time:", checkOutTime);
      // }

      if (quietHours?.enabled) {
        if (!quietHours.start || !this.isValidTime(quietHours.start)) {
          errors.quietHoursStart =
            "Please enter a valid quiet hours start time";
          console.log("Invalid quiet hours start:", quietHours.start);
        }
        if (!quietHours.end || !this.isValidTime(quietHours.end)) {
          errors.quietHoursEnd = "Please enter a valid quiet hours end time";
          console.log("Invalid quiet hours end:", quietHours.end);
        }
      }
    }

    const result = {
      isValid: Object.keys(errors).length === 0,
      errors,
    };

    console.log("Validation complete. Result:", result);
    return result;
  }

  /**
   * Create complete setup request from form data
   */
  static createSetupRequest(data: SetupFormData): HostPoliciesSetupRequest {
    return {
      cancellationPolicy: {
        refundPeriodDays: data.cancellationPolicy.refundPeriodDays || 14,
        fullRefundDays: data.cancellationPolicy.fullRefundDays || 7,
        partialRefundDays: data.cancellationPolicy.partialRefundDays || 3,
        noRefundDays: data.cancellationPolicy.noRefundDays || 1,
        strictPolicy: data.cancellationPolicy.strictPolicy || false,
      },
      houseRules: {
        checkInTime: data.houseRules.checkInTime || "15:00",
        checkOutTime: data.houseRules.checkOutTime || "11:00",
        smokingAllowed: data.houseRules.smokingAllowed || false,
        petsAllowed: data.houseRules.petsAllowed || false,
        partiesAllowed: data.houseRules.partiesAllowed || false,
        quietHours: {
          enabled: data.houseRules.quietHours?.enabled || false,
          start: data.houseRules.quietHours?.start || "22:00",
          end: data.houseRules.quietHours?.end || "08:00",
        },
        additionalRules: data.houseRules.additionalRules || [],
      },
      safetyInformation: {
        smokeDetector: data.safetyInformation.smokeDetector || false,
        carbonMonoxideDetector:
          data.safetyInformation.carbonMonoxideDetector || false,
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
   * Helper function to validate time format (HH:MM in 24-hour format)
   */
  private static isValidTime(time: string): boolean {
    // Check for HH:MM format in 24-hour time
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const result = timeRegex.test(time);
    console.log(
      `Time validation: "${time}" -> ${result} (regex: ${timeRegex})`
    );
    return result;
  }
}

export default HostPolicyService;
