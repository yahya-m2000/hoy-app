import { useState, useEffect, useCallback } from "react";
import { useHostSetup as useHostPoliciesSetup } from "./useHostPolicies";
import {
  SetupFormData,
  CancellationPolicy,
  HouseRules,
  SafetyInformation,
  PropertyInformation,
  HostPoliciesSetupRequest,
} from "../../../core/types/host.types";

interface FormErrors {
  cancellationPolicy?: Record<string, string>;
  houseRules?: Record<string, string>;
  safetyInformation?: Record<string, string>;
  propertyInformation?: Record<string, string>;
}

export const useHostSetupFormWithState = () => {
  const { setupPolicies, loading } = useHostPoliciesSetup();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SetupFormData>({
    cancellationPolicy: {
      refundPeriodDays: 14,
      fullRefundDays: 7,
      partialRefundDays: 3,
      noRefundDays: 1,
      strictPolicy: false,
    },    houseRules: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
      additionalRules: [],
    },
    safetyInformation: {
      smokeDetector: true,
      carbonMonoxideDetector: false,
      fireExtinguisher: false,
      firstAidKit: false,
      securityCamera: {
        present: false,
        location: "",
      },
      weaponsOnProperty: false,
      dangerousAnimals: false,
      additionalSafety: [],
    },
    propertyInformation: {
      amenities: [],
    },
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateFormData = useCallback(
    (
      section: keyof SetupFormData,
      data: Partial<
        | CancellationPolicy
        | HouseRules
        | SafetyInformation
        | PropertyInformation
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...data,
        },
      }));
    },
    []
  );

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Cancellation Policy
        const { cancellationPolicy } = formData;
        if (
          !cancellationPolicy.refundPeriodDays ||
          cancellationPolicy.refundPeriodDays < 1
        ) {
          errors.refundPeriodDays = "Refund period must be at least 1 day";
        }
        if (
          !cancellationPolicy.fullRefundDays ||
          cancellationPolicy.fullRefundDays < 1
        ) {
          errors.fullRefundDays = "Full refund period must be at least 1 day";
        }
        break;

      case 1: // House Rules
        const { houseRules } = formData;
        if (!houseRules.checkInTime) {
          errors.checkInTime = "Check-in time is required";
        }
        if (!houseRules.checkOutTime) {
          errors.checkOutTime = "Check-out time is required";
        }
        break;

      case 2: // Safety Information
        // Safety information is mostly optional, minimal validation
        break;

      case 3: // Property Information
        // Property information validation
        break;
    }

    return errors;
  }, [currentStep, formData]);

  const canGoNext = useCallback(() => {
    const errors = validateCurrentStep();
    return Object.keys(errors).length === 0;
  }, [validateCurrentStep]);

  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;

  const completeSetup = useCallback(async () => {
    const setupData: HostPoliciesSetupRequest = {
      cancellationPolicy: formData.cancellationPolicy as CancellationPolicy,
      houseRules: formData.houseRules as HouseRules,
      safetyInformation: formData.safetyInformation as SafetyInformation,
      propertyInformation: formData.propertyInformation as PropertyInformation,
    };

    return await setupPolicies(setupData);
  }, [formData, setupPolicies]);

  // Update form errors when step changes
  useEffect(() => {
    const errors = validateCurrentStep();
    const currentSection = [
      "cancellationPolicy",
      "houseRules",
      "safetyInformation",
      "propertyInformation",
    ][currentStep] as keyof FormErrors;

    setFormErrors((prev) => ({
      ...prev,
      [currentSection]: errors,
    }));
  }, [currentStep, validateCurrentStep]);

  return {
    // State
    isLoading: loading,
    currentStep,
    formData,
    formErrors,
    progress,

    // Computed
    canGoNext: canGoNext(),
    canGoPrevious,
    isLastStep,

    // Actions
    setCurrentStep,
    updateFormData,
    completeSetup,
  };
};
