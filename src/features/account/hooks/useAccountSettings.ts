import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUserRole, useToast, useAuth } from "@core/context";
import { account } from "@core/api/services";
import type { SettingsSection } from "@core/types";

/**
 * Custom hook for managing account settings functionality
 * Provides all sections with properly configured actions for both host and traveler roles
 */
export const useAccountSettings = () => {
  const { t } = useTranslation();
  const { userRole, setUserRole } = useUserRole();
  
  const isHost = userRole === "host";
  const toggleUserRole = useCallback(async () => {
    const newRole = userRole === "host" ? "traveler" : "host";
    await setUserRole(newRole);
  }, [userRole, setUserRole]);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Create action service with dependencies
  const actionService = useMemo(
    () =>
      new account.AccountAction.AccountActionService({
        t,
        toggleUserRole,
        showToast,
        isHost,
      }),
    [t, toggleUserRole, showToast, isHost]
  );

  // Create config service with dependencies
  const configService = useMemo(
    () =>
      new account.AccountConfig.AccountConfigService({
        t,
        getActionHandler: actionService.getActionHandler,
        isHost,
        isAuthenticated,
      }),
    [t, actionService.getActionHandler, isHost, isAuthenticated]
  );

  // Get all settings sections
  const sections: SettingsSection[] = useMemo(
    () => configService.getAllSections(),
    [configService]
  );

  return {
    sections,
    actionService,
    configService,
    isHost,
    isAuthenticated,
  };
}; 