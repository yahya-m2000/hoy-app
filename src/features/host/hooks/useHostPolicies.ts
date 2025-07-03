import { useState, useEffect, useCallback } from "react";
import { host } from "@core/api/services";
import {
  HostPolicies,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  SetupFormData,
  RefundCalculationResponse,
} from "@core/types/host.types";

/**
 * Hook for managing host policies
 */
export const useHostPolicies = () => {
  const [policies, setPolicies] = useState<HostPolicies | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await host.HostPolicyService.getHostPolicies();
      setPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicies = useCallback(
    async (updates: HostPoliciesUpdateRequest) => {
      setLoading(true);
      setError(null);
      try {
        const updatedPolicies = await host.HostPolicyService.updateHostPolicies(
          updates
        );
        setPolicies(updatedPolicies);
        return updatedPolicies;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update policies"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    loading,
    error,
    refetch: fetchPolicies,
    updatePolicies,
  };
};

/**
 * Hook for host setup process
 */
export const useHostSetup = () => {
  const [setupStatus, setSetupStatus] = useState<{
    isSetupComplete: boolean;
    completedSteps: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkSetupStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await host.HostPolicyService.checkSetupStatus();
      setSetupStatus(status);
      return status;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check setup status"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setupPolicies = useCallback(async (data: HostPoliciesSetupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const policies = await host.HostPolicyService.setupHostPolicies(data);
      setSetupStatus({
        isSetupComplete: true,
        completedSteps: ["cancellation", "rules", "safety", "property"],
      });
      return policies;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup policies");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDefaultPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const defaults = await host.HostPolicyService.getDefaultPolicies();
      return defaults;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch defaults");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  return {
    setupStatus,
    loading,
    error,
    checkSetupStatus,
    setupPolicies,
    getDefaultPolicies,
  };
};

/**
 * Hook for form validation and management
 */
export const useHostSetupForm = (initialData?: Partial<SetupFormData>) => {
  const [formData, setFormData] = useState<SetupFormData>({
    cancellationPolicy: {
      refundPeriodDays: 14,
      fullRefundDays: 7,
      partialRefundDays: 3,
      noRefundDays: 1,
      strictPolicy: false,
    },
    houseRules: {
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
      wifiNetwork: "",
      wifiPassword: "",
      checkInInstructions: "",
      keyLocation: "",
      parkingInstructions: "",
      amenities: [],
      additionalNotes: "",
    },
    ...initialData,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const updateFormData = useCallback(
    (section: keyof SetupFormData, data: any) => {
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
  const validateForm = useCallback(() => {
    console.log("Validating form data:", JSON.stringify(formData, null, 2));
    const validation = host.HostPolicyService.validateSetupData(formData);
    console.log("Validation result:", validation);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  const createSetupRequest = useCallback(() => {
    return host.HostPolicyService.createSetupRequest(formData);
  }, [formData]);
  const resetForm = useCallback(() => {
    setFormData({
      cancellationPolicy: {
        refundPeriodDays: 14,
        fullRefundDays: 7,
        partialRefundDays: 3,
        noRefundDays: 1,
        strictPolicy: false,
      },
      houseRules: {
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
        wifiNetwork: "",
        wifiPassword: "",
        checkInInstructions: "",
        keyLocation: "",
        parkingInstructions: "",
        amenities: [],
        additionalNotes: "",
      },
    });
    setValidationErrors({});
  }, []);

  return {
    formData,
    validationErrors,
    updateFormData,
    validateForm,
    createSetupRequest,
    resetForm,
  };
};

/**
 * Hook for refund calculations
 */
export const useRefundCalculation = () => {
  const [calculation, setCalculation] =
    useState<RefundCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRefund = useCallback(
    async (bookingId: string, totalAmount: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await host.HostPolicyService.calculateRefund(
          bookingId,
          totalAmount
        );
        setCalculation(result);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to calculate refund"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearCalculation = useCallback(() => {
    setCalculation(null);
    setError(null);
  }, []);

  return {
    calculation,
    loading,
    error,
    calculateRefund,
    clearCalculation,
  };
};
