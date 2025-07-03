/**
 * Account Configuration Service
 * 
 * Handles the dynamic configuration of account settings sections.
 * Provides role-aware settings menus for both host and traveler modes.
 * 
 * Features:
 * - Role-based section generation
 * - Internationalization support
 * - Dynamic action binding
 * - Authentication-aware configurations
 * 
 * @module @core/api/services/account
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { SettingsSection,  ConfigServiceDependencies } from "@core/types/account.types";
import { ACCOUNT_ACTIONS} from "@features/account/constants";

/**
 * Service class for managing account settings configurations
 * 
 * @class AccountConfigService
 */
export class AccountConfigService {
  private dependencies: ConfigServiceDependencies;

  constructor(dependencies: ConfigServiceDependencies) {
    this.dependencies = dependencies;
  }

  /**
   * Get profile management section
   * Includes both common and role-specific profile settings
   * 
   * @returns {SettingsSection} Profile settings section
   */
  getProfileSection = (): SettingsSection => {
    const { t, getActionHandler, isHost } = this.dependencies;

    const baseItems = [
      {
        id: ACCOUNT_ACTIONS["personal-info"],
        icon: "person-outline",
        title: t("profile.personalInfo"),
        subtitle: t("profile.personalInfoDesc"),
        action: getActionHandler("personal-info"),
      },
      {
        id: ACCOUNT_ACTIONS["payment-methods"],
        icon: "card-outline",
        title: t("profile.paymentMethods"),
        subtitle: t("profile.paymentMethodsDesc"),
        action: getActionHandler("payment-methods"),
      },
    ];

    // Add host-specific profile items
    if (isHost) {
      baseItems.push({
        id: ACCOUNT_ACTIONS["host-profile"],
        icon: "business-outline",
        title: t("host.settings.hostProfile"),
        subtitle: t("host.settings.hostProfileDesc"),
        action: getActionHandler("host-profile"),
      });
    }

    return {
      title: t("profile.profile"),
      items: baseItems,
    };
  };

  /**
   * Get host management section
   * Available only for users in host mode
   * 
   * @returns {SettingsSection} Host management settings
   */
  getHostManagementSection = (): SettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("host.settings.hostManagement"),
      items: [
        {
          id: ACCOUNT_ACTIONS.policies,
          icon: "document-text-outline",
          title: t("host.settings.policies"),
          subtitle: t("host.settings.policiesDesc"),
          action: getActionHandler("policies"),
        },
        {
          id: ACCOUNT_ACTIONS.properties,
          icon: "home-outline",
          title: t("host.settings.properties"),
          subtitle: t("host.settings.propertiesDesc"),
          action: getActionHandler("properties"),
        },
      ],
    };
  };

  /**
   * Get host tools section
   * Professional tools for property management
   * 
   * @returns {SettingsSection} Host tools settings
   */
  getHostToolsSection = (): SettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("host.settings.hostTools"),
      items: [
        {
          id: ACCOUNT_ACTIONS.calendar,
          icon: "calendar-outline",
          title: t("host.settings.calendar"),
          subtitle: t("host.settings.calendarDesc"),
          action: getActionHandler("calendar"),
        },
        {
          id: ACCOUNT_ACTIONS.pricing,
          icon: "pricetag-outline",
          title: t("host.settings.pricing"),
          subtitle: t("host.settings.pricingDesc"),
          action: getActionHandler("pricing"),
        },
        {
          id: ACCOUNT_ACTIONS.payouts,
          icon: "cash-outline",
          title: t("host.settings.payouts"),
          subtitle: t("host.settings.payoutsDesc"),
          action: getActionHandler("payouts"),
        },
        {
          id: ACCOUNT_ACTIONS.taxes,
          icon: "receipt-outline",
          title: t("host.settings.taxes"),
          subtitle: t("host.settings.taxesDesc"),
          action: getActionHandler("taxes"),
        },
      ],
    };
  };

  /**
   * Get traveler activity section
   * Available only for users in traveler mode
   * 
   * @returns {SettingsSection} Traveler activity settings
   */
  getTravelerActivitySection = (): SettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("profile.activity"),
      items: [
        {
          id: ACCOUNT_ACTIONS["booking-history"],
          icon: "time-outline",
          title: t("profile.bookingHistory"),
          subtitle: t("profile.bookingHistoryDesc"),
          action: getActionHandler("booking-history"),
        },
        {
          id: ACCOUNT_ACTIONS.wishlist,
          icon: "heart-outline",
          title: t("profile.wishlist"),
          subtitle: t("profile.wishlistDesc"),
          action: getActionHandler("wishlist"),
        },
      ],
    };
  };

  /**
   * Get preferences section
   * Common preferences with role-aware additions
   * 
   * @returns {SettingsSection} Preferences settings
   */
  getPreferencesSection = (): SettingsSection => {
    const { t, getActionHandler, isHost } = this.dependencies;

    const items = [
      {
        id: ACCOUNT_ACTIONS.language,
        icon: "language-outline",
        title: t("profile.language"),
        subtitle: t("profile.languageDesc"),
        action: getActionHandler("language"),
      },
      {
        id: ACCOUNT_ACTIONS.currency,
        icon: "cash-outline",
        title: t("profile.currency"),
        subtitle: t("profile.currencyDesc"),
        action: getActionHandler("currency"),
      },
    ];

    // Add host resources for hosts
    if (isHost) {
      items.push({
        id: ACCOUNT_ACTIONS["host-resources"],
        icon: "school-outline",
        title: t("host.settings.hostResources"),
        subtitle: t("host.settings.hostResourcesDesc"),
        action: getActionHandler("host-resources"),
      });
    }

    return {
      title: t("profile.preferences"),
      items,
    };
  };

  /**
   * Get account settings section
   * Security and account management options
   * 
   * @returns {SettingsSection} Account settings
   */
  getAccountSettingsSection = (): SettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("profile.accountSettings"),
      items: [
        {
          id: ACCOUNT_ACTIONS.logout,
          icon: "log-out-outline",
          title: t("profile.logout"),
          subtitle: t("profile.logoutDesc"),
          action: getActionHandler("logout"),
        },
        {
          id: ACCOUNT_ACTIONS["delete-account"],
          icon: "trash-outline",
          title: t("profile.deleteAccount"),
          subtitle: t("profile.deleteAccountDesc"),
          action: getActionHandler("delete-account"),
          isDanger: true,
        },
      ],
    };
  };

  /**
   * Get support section
   * Help and information resources
   * 
   * @returns {SettingsSection} Support settings
   */
  getSupportSection = (): SettingsSection => {
    const { t, getActionHandler } = this.dependencies;

    return {
      title: t("profile.support"),
      items: [
        {
          id: ACCOUNT_ACTIONS.support,
          icon: "help-circle-outline",
          title: t("profile.support"),
          subtitle: t("profile.supportDesc"),
          action: getActionHandler("support"),
        },
        {
          id: ACCOUNT_ACTIONS.about,
          icon: "information-circle-outline",
          title: t("profile.about"),
          subtitle: t("profile.aboutDesc"),
          action: getActionHandler("about"),
        },
      ],
    };
  };

  /**
   * Get role switching section
   * Toggle between host and traveler modes
   * 
   * @returns {SettingsSection} Role switch settings
   */
  getRoleSwitchSection = (): SettingsSection => {
    const { t, getActionHandler, isHost } = this.dependencies;

    const switchAction = isHost ? "switch-to-traveler" : "switch-to-host";
    const title = isHost 
      ? t("host.settings.switchToTraveler")
      : t("traveler.switchToHost");
    const subtitle = isHost
      ? t("host.settings.switchToTravelerDesc")
      : t("traveler.switchToHostDesc");

    return {
      title: t("common.mode"),
      items: [
        {
          id: ACCOUNT_ACTIONS[switchAction],
          icon: "swap-horizontal-outline",
          title,
          subtitle,
          action: getActionHandler(switchAction),
        },
      ],
    };
  };

  /**
   * Get all settings sections based on user role and authentication
   * 
   * @returns {SettingsSection[]} Array of configured settings sections
   */
  getAllSections = (): SettingsSection[] => {
    const { isHost, isAuthenticated } = this.dependencies;

    // Unauthenticated users only see support
    if (!isAuthenticated) {
      return [
        this.getSupportSection(),
      ];
    }

    // Build sections array based on role
    const sections: SettingsSection[] = [
      this.getProfileSection(),
    ];

    // Add role-specific sections
    if (isHost) {
      sections.push(
        this.getHostManagementSection(),
        this.getHostToolsSection()
      );
    } else {
      sections.push(
        this.getTravelerActivitySection()
      );
    }

    // Add common sections
    sections.push(
      this.getPreferencesSection(),
      this.getAccountSettingsSection(),
      this.getSupportSection(),
      this.getRoleSwitchSection()
    );

    return sections;
  };
}

// Default export
export default AccountConfigService; 