import { Alert } from "react-native";
import type { HostSettingsAction } from "../utils/types";

export interface ActionHandlerDependencies {
  t: (key: string) => string;
  toggleUserRole: () => Promise<void>;
  showToast: (params: {
    type: "success" | "error" | "info";
    message: string;
  }) => void;
}

export class HostSettingsActionService {
  private dependencies: ActionHandlerDependencies;

  constructor(dependencies: ActionHandlerDependencies) {
    this.dependencies = dependencies;
  }

  /**
   * Handle switching to traveler mode with confirmation dialog
   */
  handleSwitchToTraveler = () => {
    const { t, toggleUserRole, showToast } = this.dependencies;

    Alert.alert(
      t("host.settings.switchToTraveler"),
      t("host.settings.switchToTravelerDesc"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          style: "default",
          onPress: async () => {
            try {
              await toggleUserRole();
              showToast({
                type: "success",
                message: t("common.switchedToTraveler"),
              });
            } catch (error) {
              console.error("Error switching to traveler mode:", error);
              showToast({
                type: "error",
                message: t("errors.generic"),
              });
            }
          },
        },
      ]
    );
  };

  /**
   * Handle coming soon features with info toast
   */
  handleComingSoon = () => {
    const { t, showToast } = this.dependencies;
    showToast({
      type: "info",
      message: t("host.settings.comingSoon"),
    });
  };

  /**
   * Get the appropriate action handler for a given action type
   */
  getActionHandler = (action: HostSettingsAction): (() => void) => {
    switch (action) {
      case "switch-to-traveler":
        return this.handleSwitchToTraveler;
      default:
        return this.handleComingSoon;
    }
  };
}
