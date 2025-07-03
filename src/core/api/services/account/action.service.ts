/**
 * Account Action Service
 * 
 * Handles all account-related user actions and navigation.
 * Provides a centralized dispatcher for account settings actions
 * with support for both host and traveler modes.
 * 
 * Features:
 * - Role-aware action handling
 * - Navigation management
 * - Alert confirmations
 * - Toast notifications
 * 
 * @module @core/api/services/account
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { Alert} from "react-native";
import { router } from "expo-router";
import type { AccountAction, ActionServiceDependencies } from "@core/types/account.types";
import { logger } from "@core/utils/sys/log";

/**
 * Service class for handling account-related actions
 * 
 * @class AccountActionService
 */
export class AccountActionService {
  private dependencies: ActionServiceDependencies;

  constructor(dependencies: ActionServiceDependencies) {
    this.dependencies = dependencies;
  }

  // ========================================
  // Common Actions
  // ========================================

  /**
   * Handle edit profile action
   * Should be overridden by component to show PersonalInfoModal
   */
  handleEditProfile = (): void => {
    router.navigate("/account/personal-info");
  };

  /**
   * Handle personal info display
   * Should be overridden by component to show PersonalInfoModal
   */
  handlePersonalInfo = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle notifications settings
   * Should be overridden by component to show NotificationsModal
   */
  handleNotifications = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle payment methods management
   * Should be overridden by component to show PaymentMethodsModal
   */
  handlePaymentMethods = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle privacy settings
   */
  handlePrivacy = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle security settings
   * Should be overridden by component to show AuthModal for password change
   */
  handleSecurity = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle language selection
   * Should be overridden by component to show LanguageModal
   */
  handleLanguage = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle currency selection
   * Should be overridden by component to show CurrencyModal
   */
  handleCurrency = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle support request
   */
  handleSupport = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle about information
   */
  handleAbout = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle terms and conditions
   */
  handleTerms = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle privacy policy
   */
  handlePrivacyPolicy = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle account deletion with confirmation
   */
  handleDeleteAccount = (): void => {
    const { t, showToast } = this.dependencies;
    
    Alert.alert(
      t("account.deleteAccount"),
      t("account.deleteAccountWarning"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            showToast({
              type: "info",
              message: t("account.deleteAccountComingSoon"),
            });
          },
        },
      ]
    );
  };

  // ========================================
  // Host-Specific Actions
  // ========================================

  /**
   * Handle switching from host to traveler mode
   */
  handleSwitchToTraveler = (): void => {
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
              logger.error("Error switching to traveler mode:", error);
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
   * Handle host profile management
   */
  handleHostProfile = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle policies configuration
   */
  handlePolicies = (): void => {
    this.handleComingSoon();
  };

  /**
   * Navigate to properties listing
   */
  handleProperties = (): void => {
    router.navigate("/(tabs)/host/listings");
  };

  /**
   * Navigate to calendar view
   */
  handleCalendar = (): void => {
    router.navigate("/(tabs)/host/calendar");
  };

  /**
   * Handle pricing configuration
   */
  handlePricing = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle payout settings
   */
  handlePayouts = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle tax information
   */
  handleTaxes = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle host resources
   */
  handleHostResources = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle QR code display
   * Should be overridden by component to show QRCodeModal
   */
  handleShowQRCode = (): void => {
    this.handleComingSoon();
  };

  // ========================================
  // Traveler-Specific Actions
  // ========================================

  /**
   * Handle switching from traveler to host mode
   */
  handleSwitchToHost = (): void => {
    const { t, toggleUserRole, showToast } = this.dependencies;

    Alert.alert(
      t("traveler.settings.switchToHost"),
      t("traveler.settings.switchToHostDesc"),
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
                message: t("common.switchedToHost"),
              });
            } catch (error) {
              logger.error("Error switching to host mode:", error);
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
   * Navigate to booking history
   */
  handleBookingHistory = (): void => {
    router.navigate("/(tabs)/traveler/bookings");
  };

  /**
   * Navigate to wishlist
   */
  handleWishlist = (): void => {
    router.navigate("/(tabs)/traveler/wishlist");
  };

  /**
   * Handle reviews management
   */
  handleReviews = (): void => {
    this.handleComingSoon();
  };

  /**
   * Handle travel preferences
   */
  handleTravelPreferences = (): void => {
    this.handleComingSoon();
  };

  // ========================================
  // Utility Functions
  // ========================================

  /**
   * Display coming soon toast notification
   */
  private handleComingSoon = (): void => {
    const { t, showToast } = this.dependencies;
    showToast({
      type: "info",
      message: t("common.comingSoon"),
    });
  };

  /**
   * Handle logout action
   * @throws {Error} Should be handled by AccountSection component
   */
  handleLogout = (): void => {
    throw new Error("Logout should be handled by AccountSection component");
  };

  // ========================================
  // Action Dispatcher
  // ========================================

  /**
   * Get action handler for a specific account action
   * @param action - The action to handle
   * @returns Handler function for the action
   */
  getActionHandler = (action: AccountAction): (() => void) => {
    switch (action) {
      // Common actions
      case "edit-profile":
        return this.handleEditProfile;
      case "personal-info":
        return this.handlePersonalInfo;
      case "notifications":
        return this.handleNotifications;
      case "payment-methods":
        return this.handlePaymentMethods;
      case "privacy":
        return this.handlePrivacy;
      case "security":
        return this.handleSecurity;
      case "language":
        return this.handleLanguage;
      case "currency":
        return this.handleCurrency;
      case "support":
        return this.handleSupport;
      case "about":
        return this.handleAbout;
      case "terms":
        return this.handleTerms;
      case "privacy-policy":
        return this.handlePrivacyPolicy;
      case "delete-account":
        return this.handleDeleteAccount;

      // Host-specific actions
      case "switch-to-traveler":
        return this.handleSwitchToTraveler;
      case "host-profile":
        return this.handleHostProfile;
      case "policies":
        return this.handlePolicies;
      case "properties":
        return this.handleProperties;
      case "calendar":
        return this.handleCalendar;
      case "pricing":
        return this.handlePricing;
      case "payouts":
        return this.handlePayouts;
      case "taxes":
        return this.handleTaxes;
      case "host-resources":
        return this.handleHostResources;
      case "show-qr-code":
        return this.handleShowQRCode;

      // Traveler-specific actions
      case "switch-to-host":
        return this.handleSwitchToHost;
      case "booking-history":
        return this.handleBookingHistory;
      case "wishlist":
        return this.handleWishlist;
      case "reviews":
        return this.handleReviews;
      case "travel-preferences":
        return this.handleTravelPreferences;

      case "logout":
        return this.handleLogout;

      default:
        return this.handleComingSoon;
    }
  };
}

// Default export
export default AccountActionService; 