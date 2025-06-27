import type { HostSettingsSection, HostSettingsAction } from "../utils/types";
import { SETTINGS_ACTIONS } from "../utils/constants";

export interface SettingsConfigDependencies {
  t: (key: string) => string;
  getActionHandler: (action: HostSettingsAction) => () => void;
}

export class HostSettingsConfigService {
  private dependencies: SettingsConfigDependencies;

  constructor(dependencies: SettingsConfigDependencies) {
    this.dependencies = dependencies;
  }

  /**
   * Get host profile and management settings section
   */
  getHostManagementSection = (): HostSettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("host.settings.hostProfile"),
      items: [
        {
          id: SETTINGS_ACTIONS["host-profile"],
          icon: "person-outline",
          title: t("host.settings.hostProfile"),
          subtitle: t("host.settings.hostProfileDesc"),
          action: getActionHandler("host-profile"),
        },
        {
          id: SETTINGS_ACTIONS.policies,
          icon: "document-text-outline",
          title: t("host.settings.policies"),
          subtitle: t("host.settings.policiesDesc"),
          action: getActionHandler("policies"),
        },
        {
          id: SETTINGS_ACTIONS.properties,
          icon: "home-outline",
          title: t("host.settings.properties"),
          subtitle: t("host.settings.propertiesDesc"),
          action: getActionHandler("properties"),
        },
      ],
    };
  };

  /**
   * Get host tools and operations section
   */
  getHostToolsSection = (): HostSettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("host.settings.hostTools"),
      items: [
        {
          id: SETTINGS_ACTIONS.calendar,
          icon: "calendar-outline",
          title: t("host.settings.calendar"),
          subtitle: t("host.settings.calendarDesc"),
          action: getActionHandler("calendar"),
        },
        {
          id: SETTINGS_ACTIONS.pricing,
          icon: "pricetag-outline",
          title: t("host.settings.pricing"),
          subtitle: t("host.settings.pricingDesc"),
          action: getActionHandler("pricing"),
        },
        {
          id: SETTINGS_ACTIONS.payouts,
          icon: "card-outline",
          title: t("host.settings.payouts"),
          subtitle: t("host.settings.payoutsDesc"),
          action: getActionHandler("payouts"),
        },
        {
          id: SETTINGS_ACTIONS.taxes,
          icon: "receipt-outline",
          title: t("host.settings.taxes"),
          subtitle: t("host.settings.taxesDesc"),
          action: getActionHandler("taxes"),
        },
      ],
    };
  };

  /**
   * Get preferences and support section
   */
  getPreferencesSection = (): HostSettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("settings.preferences"),
      items: [
        {
          id: SETTINGS_ACTIONS.notifications,
          icon: "notifications-outline",
          title: t("host.settings.notifications"),
          subtitle: t("host.settings.notificationsDesc"),
          action: getActionHandler("notifications"),
        },
        {
          id: SETTINGS_ACTIONS.support,
          icon: "help-circle-outline",
          title: t("host.settings.support"),
          subtitle: t("host.settings.supportDesc"),
          action: getActionHandler("support"),
        },
        {
          id: SETTINGS_ACTIONS.resources,
          icon: "school-outline",
          title: t("host.settings.hostResources"),
          subtitle: t("host.settings.hostResourcesDesc"),
          action: getActionHandler("resources"),
        },
      ],
    };
  };

  /**
   * Get role switching section
   */
  getRoleSwitchSection = (): HostSettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("common.mode"),
      items: [
        {
          id: SETTINGS_ACTIONS["switch-to-traveler"],
          icon: "swap-horizontal-outline",
          title: t("host.settings.switchToTraveler"),
          subtitle: t("host.settings.switchToTravelerDesc"),
          action: getActionHandler("switch-to-traveler"),
        },
      ],
    };
  };

  /**
   * Get all settings sections
   */
  getAllSections = (): HostSettingsSection[] => {
    return [
      this.getHostManagementSection(),
      this.getHostToolsSection(),
      this.getPreferencesSection(),
      this.getRoleSwitchSection(),
    ];
  };
}
