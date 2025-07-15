/**
 * Hook for checking host setup status
 * Determines if a user needs to complete host setup and manages setup state
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { host } from "@core/api/services";
import { useUserRole } from "@core/context";
import { BETA_CONFIG } from '@core/config/beta';

export interface HostSetupStatus {
  isSetupComplete: boolean;
  completedSteps: string[];
  needsSetup: boolean;
}

export const useHostSetupStatus = () => {
  const { userRole } = useUserRole();
  const [setupModalVisible, setSetupModalVisible] = useState(false);

  // Only check setup status if user is in host role
  const { data: setupStatus, isLoading, error, refetch } = useQuery({
    queryKey: ["hostSetupStatus"],
    queryFn: async (): Promise<HostSetupStatus> => {
      if (BETA_CONFIG.isBeta) {
        return {
          isSetupComplete: true,
          completedSteps: [],
          needsSetup: false,
        };
      }
      try {
        const status = await host.HostPolicyService.checkSetupStatus();
        return {
          ...status,
          needsSetup: !status.isSetupComplete,
        };
      } catch (error: any) {
        // If we get a 403, it means the user hasn't completed setup
        if (error?.response?.status === 403) {
          return {
            isSetupComplete: false,
            completedSteps: [],
            needsSetup: true,
          };
        }
        // For other errors, assume setup is needed
        console.error("Error checking host setup status:", error);
        return {
          isSetupComplete: false,
          completedSteps: [],
          needsSetup: true,
        };
      }
    },
    enabled: userRole === "host",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (user needs to complete setup)
      if (error?.response?.status === 403) {
        return false;
      }
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  const showSetupModal = useCallback(() => {
    setSetupModalVisible(true);
  }, []);

  const hideSetupModal = useCallback(() => {
    setSetupModalVisible(false);
  }, []);

  const handleSetupComplete = useCallback(() => {
    setSetupModalVisible(false);
    // Refetch setup status to update the UI
    refetch();
  }, [refetch]);

  return {
    setupStatus: setupStatus || {
      isSetupComplete: false,
      completedSteps: [],
      needsSetup: true,
    },
    isLoading,
    error,
    setupModalVisible,
    showSetupModal,
    hideSetupModal,
    handleSetupComplete,
    refetch,
  };
}; 