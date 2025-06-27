import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUserRole, useToast } from "@shared/context";
import {
  HostSettingsActionService,
  HostSettingsConfigService,
} from "../services";
import type { HostSettingsSection } from "../utils/types";

/**
 * Custom hook for managing host settings functionality
 * Provides all sections with properly configured actions
 */
export const useHostSettings = () => {
  const { t } = useTranslation();
  const { toggleUserRole } = useUserRole();
  const { showToast } = useToast();

  // Create action service with dependencies
  const actionService = useMemo(
    () =>
      new HostSettingsActionService({
        t,
        toggleUserRole,
        showToast,
      }),
    [t, toggleUserRole, showToast]
  );

  // Create config service with dependencies
  const configService = useMemo(
    () =>
      new HostSettingsConfigService({
        t,
        getActionHandler: actionService.getActionHandler,
      }),
    [t, actionService.getActionHandler]
  );

  // Get all settings sections
  const sections: HostSettingsSection[] = useMemo(
    () => configService.getAllSections(),
    [configService]
  );

  return {
    sections,
    actionService,
    configService,
  };
};
