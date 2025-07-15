/**
 * Host Setup Service
 * 
 * Comprehensive service for the new Airbnb-style host setup flow including:
 * - Account verification (email, phone, identity)
 * - Host agreement acceptance
 * - Default policies configuration
 * - Host preferences setup
 * - Profile completion
 * - Setup progress tracking
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { api } from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import {
  HostSetupStatusResponse,
  HostSetupData,
  HostSetupFormData,
  VerificationResult,
  VerificationCodeRequest,
  VerificationCodeVerification,
  VerificationUpdateRequest,
  AgreementUpdateRequest,
  DefaultPoliciesUpdateRequest,
  PreferencesUpdateRequest,
  ProfileUpdateRequest,
  CompleteHostSetupRequest,
  StepValidationResult,
} from "@core/types/host.types";

// Generic API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Host Setup API Service
 * Handles all API operations for the new Airbnb-style host setup flow
 */
export class HostSetupService {
  /**
   * Get host setup status and progress
   * 
   * @returns Promise<HostSetupStatusResponse> - Current setup status
   * @throws Error if fetching status fails
   */
  static async getSetupStatus(): Promise<HostSetupStatusResponse> {
    try {
      const response = await api.get<HostSetupStatusResponse>("/host/setup/status");
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.getSetupStatus", error);
      throw error;
    }
  }

  /**
   * Get default setup data template
   * 
   * @returns Promise<HostSetupData> - Default setup data structure
   * @throws Error if fetching defaults fails
   */
  static async getDefaultSetupData(): Promise<ApiResponse<{ defaultSetup: HostSetupData }>> {
    try {
      const response = await api.get<ApiResponse<{ defaultSetup: HostSetupData }>>("/host/setup/defaults");
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.getDefaultSetupData", error);
      throw error;
    }
  }

  // ========================================
  // VERIFICATION METHODS
  // ========================================

  /**
   * Send email verification code
   * 
   * @param email - Email address to verify
   * @returns Promise<VerificationResult> - Verification result with ID
   * @throws Error if sending fails
   */
  static async sendEmailVerification(email: string): Promise<VerificationResult> {
    try {
      const response = await api.post<VerificationResult>("/host/setup/verification/email/send", {
        email,
      });
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.sendEmailVerification", error);
      throw error;
    }
  }

  /**
   * Send phone verification code
   * 
   * @param phoneNumber - Phone number to verify
   * @returns Promise<VerificationResult> - Verification result with ID
   * @throws Error if sending fails
   */
  static async sendPhoneVerification(phoneNumber: string): Promise<VerificationResult> {
    try {
      const response = await api.post<VerificationResult>("/host/setup/verification/phone/send", {
        phoneNumber,
      });
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.sendPhoneVerification", error);
      throw error;
    }
  }

  /**
   * Verify email code
   * 
   * @param verification - Verification ID and code
   * @returns Promise<VerificationResult> - Verification result
   * @throws Error if verification fails
   */
  static async verifyEmailCode(verification: VerificationCodeVerification): Promise<VerificationResult> {
    try {
      const response = await api.post<VerificationResult>("/host/setup/verification/email/verify", verification);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.verifyEmailCode", error);
      throw error;
    }
  }

  /**
   * Verify phone code
   * 
   * @param verification - Verification ID and code
   * @returns Promise<VerificationResult> - Verification result
   * @throws Error if verification fails
   */
  static async verifyPhoneCode(verification: VerificationCodeVerification): Promise<VerificationResult> {
    try {
      const response = await api.post<VerificationResult>("/host/setup/verification/phone/verify", verification);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.verifyPhoneCode", error);
      throw error;
    }
  }

  /**
   * Start identity verification process
   * 
   * @returns Promise<VerificationResult> - Identity verification session
   * @throws Error if starting verification fails
   */
  static async startIdentityVerification(): Promise<VerificationResult> {
    try {
      const response = await api.post<VerificationResult>("/host/setup/verification/identity/start");
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.startIdentityVerification", error);
      throw error;
    }
  }

  /**
   * Update verification status
   * 
   * @param data - Verification update data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updateVerification(data: VerificationUpdateRequest): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.post<ApiResponse<{ hostSetup: HostSetupData }>>("/host/setup/verification", data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updateVerification", error);
      throw error;
    }
  }

  // ========================================
  // AGREEMENT METHODS
  // ========================================

  /**
   * Update host agreement status
   * 
   * @param data - Agreement update data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updateAgreement(data: AgreementUpdateRequest): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.post<ApiResponse<{ hostSetup: HostSetupData }>>("/host/setup/agreement", data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updateAgreement", error);
      throw error;
    }
  }

  // ========================================
  // POLICIES METHODS
  // ========================================

  /**
   * Update default policies
   * 
   * @param data - Default policies update data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updateDefaultPolicies(data: DefaultPoliciesUpdateRequest): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.post<ApiResponse<{ hostSetup: HostSetupData }>>("/host/setup/policies", data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updateDefaultPolicies", error);
      throw error;
    }
  }

  // ========================================
  // PREFERENCES METHODS
  // ========================================

  /**
   * Update host preferences
   * 
   * @param data - Preferences update data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updatePreferences(data: PreferencesUpdateRequest): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.post<ApiResponse<{ hostSetup: HostSetupData }>>("/host/setup/preferences", data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updatePreferences", error);
      throw error;
    }
  }

  // ========================================
  // PROFILE METHODS
  // ========================================

  /**
   * Update host profile
   * 
   * @param data - Profile update data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updateProfile(data: ProfileUpdateRequest): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.post<ApiResponse<{ hostSetup: HostSetupData }>>("/host/setup/profile", data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updateProfile", error);
      throw error;
    }
  }

  // ========================================
  // SETUP COMPLETION METHODS
  // ========================================

  /**
   * Complete host setup (promote to host)
   * 
   * @param data - Complete setup data (optional, uses saved data if not provided)
   * @returns Promise<ApiResponse<CompleteSetupResponse>> - Setup completion result
   * @throws Error if completion fails
   */
  static async completeSetup(data?: CompleteHostSetupRequest): Promise<ApiResponse<{
    user: {
      id: string;
      role: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    hostSetup: HostSetupData;
    nextSteps: string[];
  }>> {
    try {
      const response = await api.post<ApiResponse<{
        user: {
          id: string;
          role: string;
          firstName: string;
          lastName: string;
          email: string;
        };
        hostSetup: HostSetupData;
        nextSteps: string[];
      }>>("/host/setup/complete", data || {});
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.completeSetup", error);
      throw error;
    }
  }

  /**
   * Update specific setup step
   * 
   * @param step - Step identifier
   * @param data - Step-specific data
   * @returns Promise<ApiResponse<HostSetupData>> - Updated setup data
   * @throws Error if update fails
   */
  static async updateStep(step: string, data: any): Promise<ApiResponse<{ hostSetup: HostSetupData }>> {
    try {
      const response = await api.put<ApiResponse<{ hostSetup: HostSetupData }>>(`/host/setup/step/${step}`, data);
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostSetupService.updateStep", error);
      throw error;
    }
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Validate step data client-side
   * 
   * @param step - Step identifier
   * @param data - Step data to validate
   * @returns StepValidationResult - Validation result
   */
  static validateStepData(step: string, data: any): StepValidationResult {
    const errors: Record<string, string> = {};

    switch (step) {
      case "verification":
        if (!data.verification) {
          errors.verification = "Verification data is required";
          break;
        }
        if (!data.verification.isEmailVerified) {
          errors.emailVerification = "Email verification is required";
        }
        if (!data.verification.isPhoneVerified) {
          errors.phoneVerification = "Phone verification is required";
        }
        if (!data.verification.isIdentityVerified) {
          errors.identityVerification = "Identity verification is required";
        }
        break;

      case "agreement":
        if (!data.agreement) {
          errors.agreement = "Agreement data is required";
          break;
        }
        if (!data.agreement.termsAccepted) {
          errors.termsAccepted = "Terms of service must be accepted";
        }
        if (!data.agreement.privacyPolicyAccepted) {
          errors.privacyPolicyAccepted = "Privacy policy must be accepted";
        }
        break;

      case "defaultPolicies":
        if (!data.defaultPolicies) {
          errors.defaultPolicies = "Default policies are required";
          break;
        }
        
        // Validate cancellation policy
        const cancelPolicy = data.defaultPolicies.cancellationPolicy;
        if (!cancelPolicy?.type) {
          errors.cancellationType = "Cancellation policy type is required";
        }
        if (cancelPolicy?.refundPeriodDays < 0) {
          errors.refundPeriodDays = "Refund period must be 0 or more days";
        }

        // Validate house rules
        const houseRules = data.defaultPolicies.houseRules;
        if (!houseRules?.checkInTime) {
          errors.checkInTime = "Check-in time is required";
        }
        if (!houseRules?.checkOutTime) {
          errors.checkOutTime = "Check-out time is required";
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (houseRules?.checkInTime && !timeRegex.test(houseRules.checkInTime)) {
          errors.checkInTime = "Check-in time must be in HH:MM format";
        }
        if (houseRules?.checkOutTime && !timeRegex.test(houseRules.checkOutTime)) {
          errors.checkOutTime = "Check-out time must be in HH:MM format";
        }
        break;

      case "preferences":
        if (!data.preferences) {
          errors.preferences = "Preferences are required";
          break;
        }
        if (!data.preferences.responseTime) {
          errors.responseTime = "Response time preference is required";
        }
        if (!data.preferences.languages || data.preferences.languages.length === 0) {
          errors.languages = "At least one language must be specified";
        }
        if (!data.preferences.timezone) {
          errors.timezone = "Timezone is required";
        }
        if (!data.preferences.currency) {
          errors.currency = "Currency preference is required";
        }
        break;

      case "profile":
        if (!data.profile) {
          errors.profile = "Profile data is required";
          break;
        }
        if (!data.profile.languages || data.profile.languages.length === 0) {
          errors.languages = "At least one language must be specified";
        }
        if (data.profile.bio && data.profile.bio.length > 2000) {
          errors.bio = "Bio must be 2000 characters or less";
        }
        break;

      default:
        errors.step = `Unknown step: ${step}`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      canProceed: Object.keys(errors).length === 0,
    };
  }

  /**
   * Validate business logic rules
   * 
   * @param data - Complete setup data
   * @returns StepValidationResult - Validation result
   */
  static validateBusinessRules(data: HostSetupFormData): StepValidationResult {
    const errors: Record<string, string> = {};

    // Validate cancellation policy logic
    if (data.defaultPolicies?.cancellationPolicy) {
      const { refundPeriodDays, fullRefundDays, partialRefundDays, noRefundDays } = 
        data.defaultPolicies.cancellationPolicy;

      if (fullRefundDays && refundPeriodDays && fullRefundDays > refundPeriodDays) {
        errors.fullRefundDays = "Full refund days cannot exceed refund period days";
      }
      if (partialRefundDays && fullRefundDays && partialRefundDays > fullRefundDays) {
        errors.partialRefundDays = "Partial refund days cannot exceed full refund days";
      }
      if (noRefundDays && partialRefundDays && noRefundDays > partialRefundDays) {
        errors.noRefundDays = "No refund days cannot exceed partial refund days";
      }
    }

    // Validate check-in/check-out times
    if (data.defaultPolicies?.houseRules) {
      const { checkInTime, checkOutTime } = data.defaultPolicies.houseRules;
      
      if (checkInTime && checkOutTime) {
        const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
        
        if (checkIn >= checkOut) {
          errors.checkInTime = "Check-in time must be before check-out time";
        }
      }
    }

    // Validate quiet hours
    if (data.defaultPolicies?.houseRules?.quietHours?.enabled) {
      const { start, end } = data.defaultPolicies.houseRules.quietHours;
      
      if (start && end && start === end) {
        errors.quietHoursStart = "Quiet hours start and end times cannot be the same";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      canProceed: Object.keys(errors).length === 0,
    };
  }

  /**
   * Create setup request from form data
   * 
   * @param formData - Partial form data
   * @returns CompleteHostSetupRequest - Complete setup request
   */
  static createSetupRequest(formData: HostSetupFormData): CompleteHostSetupRequest {
    return {
      verification: {
        isEmailVerified: formData.verification?.isEmailVerified || false,
        isPhoneVerified: formData.verification?.isPhoneVerified || false,
        isIdentityVerified: formData.verification?.isIdentityVerified || false,
        identityDocuments: formData.verification?.identityDocuments || [],
        verificationProvider: formData.verification?.verificationProvider,
      },
      agreement: {
        termsAccepted: formData.agreement?.termsAccepted || false,
        privacyPolicyAccepted: formData.agreement?.privacyPolicyAccepted || false,
        termsVersion: formData.agreement?.termsVersion,
        privacyPolicyVersion: formData.agreement?.privacyPolicyVersion,
        hostGuaranteeAccepted: formData.agreement?.hostGuaranteeAccepted,
      },
      defaultPolicies: {
        cancellationPolicy: {
          type: formData.defaultPolicies?.cancellationPolicy?.type || "moderate",
          refundPeriodDays: formData.defaultPolicies?.cancellationPolicy?.refundPeriodDays || 14,
          fullRefundDays: formData.defaultPolicies?.cancellationPolicy?.fullRefundDays || 7,
          partialRefundDays: formData.defaultPolicies?.cancellationPolicy?.partialRefundDays || 3,
          noRefundDays: formData.defaultPolicies?.cancellationPolicy?.noRefundDays || 1,
          partialRefundPercentage: formData.defaultPolicies?.cancellationPolicy?.partialRefundPercentage || 50,
        },
        houseRules: {
          checkInTime: formData.defaultPolicies?.houseRules?.checkInTime || "15:00",
          checkOutTime: formData.defaultPolicies?.houseRules?.checkOutTime || "11:00",
          smokingAllowed: formData.defaultPolicies?.houseRules?.smokingAllowed || false,
          petsAllowed: formData.defaultPolicies?.houseRules?.petsAllowed || false,
          partiesAllowed: formData.defaultPolicies?.houseRules?.partiesAllowed || false,
          quietHours: {
            enabled: formData.defaultPolicies?.houseRules?.quietHours?.enabled || true,
            start: formData.defaultPolicies?.houseRules?.quietHours?.start || "22:00",
            end: formData.defaultPolicies?.houseRules?.quietHours?.end || "08:00",
          },
          additionalRules: formData.defaultPolicies?.houseRules?.additionalRules || [],
          minimumAge: formData.defaultPolicies?.houseRules?.minimumAge || 18,
        },
        checkInPreferences: {
          selfCheckIn: formData.defaultPolicies?.checkInPreferences?.selfCheckIn || true,
          keyPickup: formData.defaultPolicies?.checkInPreferences?.keyPickup || false,
          meetAndGreet: formData.defaultPolicies?.checkInPreferences?.meetAndGreet || false,
          instructions: formData.defaultPolicies?.checkInPreferences?.instructions,
          keyLocation: formData.defaultPolicies?.checkInPreferences?.keyLocation,
        },
      },
      preferences: {
        responseTime: formData.preferences?.responseTime || "within_24_hours",
        instantBooking: formData.preferences?.instantBooking || false,
        minimumNotice: formData.preferences?.minimumNotice || 24,
        maxAdvanceBooking: formData.preferences?.maxAdvanceBooking || 365,
        languages: formData.preferences?.languages || ["en"],
        timezone: formData.preferences?.timezone || "UTC",
        currency: formData.preferences?.currency || "USD",
        notifications: {
          email: formData.preferences?.notifications?.email ?? true,
          push: formData.preferences?.notifications?.push ?? true,
          sms: formData.preferences?.notifications?.sms ?? false,
          bookingRequests: formData.preferences?.notifications?.bookingRequests ?? true,
          messages: formData.preferences?.notifications?.messages ?? true,
          reviews: formData.preferences?.notifications?.reviews ?? true,
          payments: formData.preferences?.notifications?.payments ?? true,
        },
      },
      profile: {
        bio: formData.profile?.bio,
        photo: formData.profile?.photo,
        languages: formData.profile?.languages || ["en"],
        isSuperhost: formData.profile?.isSuperhost || false,
        location: formData.profile?.location,
        occupation: formData.profile?.occupation,
        interests: formData.profile?.interests || [],
      },
    };
  }
}

// Export individual functions for easier importing
export const {
  getSetupStatus,
  getDefaultSetupData,
  sendEmailVerification,
  sendPhoneVerification,
  verifyEmailCode,
  verifyPhoneCode,
  startIdentityVerification,
  updateVerification,
  updateAgreement,
  updateDefaultPolicies,
  updatePreferences,
  updateProfile,
  completeSetup,
  updateStep,
  validateStepData,
  validateBusinessRules,
  createSetupRequest,
} = HostSetupService;

export default HostSetupService; 