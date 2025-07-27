/**
 * ProfileSection component
 * Consolidated component that combines all account section components
 * Renders different sections based on authentication state and user preferences
 */

import React, { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useSegments } from "expo-router";

// Base Components
import SettingsSection from "./SettingsSection";
import { Button } from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks";
import { useUserRole, useCurrency } from "@core/context";
import { api } from "@core/api/client";
import { useCurrentUser } from "@features/user/hooks";

// Types
import type { SettingsItem } from "@core/types";

// Utils
import { showCleanSlateAlert } from "@core/utils/network/cache-manager";

interface ProfileSectionProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  showDevOptions?: boolean;
  lastRefresh?: number;
  onRefresh?: () => void;
}

export default function ProfileSection({
  isAuthenticated,
  onLogout,
  showDevOptions = false,
  lastRefresh = Date.now(),
  onRefresh = () => {},
}: ProfileSectionProps) {
  const { theme, isDark, toggleTheme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { data: user } = useCurrentUser();
  const { setUserRole, isRoleLoading, userRole } = useUserRole();
  const segments = useSegments();
  const segmentsArray = Array.from(segments) as string[];
  const isHostTab = segmentsArray[1] === "host";
  const isHost = user?.role === "host";

  console.log(
    "ProfileSection - user?.role:",
    user?.role,
    "userRole:",
    userRole,
    "isHost:",
    isHost
  );

  // Helper functions
  const toggleUserRole = () => {
    const newRole = isHost ? "traveler" : "host";
    setUserRole(newRole);
  };

  const getSymbol = (currencyCode: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
      JPY: "¥",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
      MXN: "$",
      KRW: "₩",
      SGD: "S$",
      HKD: "HK$",
      CHF: "CHF",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      PLN: "zł",
      CZK: "Kč",
      HUF: "Ft",
      RUB: "₽",
      TRY: "₺",
      ZAR: "R",
      AED: "د.إ",
      SAR: "﷼",
      EGP: "£",
      MAD: "د.م.",
      TND: "د.ت",
    };
    return symbols[currencyCode] || currencyCode;
  };

  const getLanguageDisplayName = () => {
    switch (i18n.language) {
      case "en":
        return "English";
      case "fr":
        return "Français";
      case "ar":
        return "العربية";
      case "so":
        return "Soomaali";
      default:
        return "English";
    }
  };

  const showComingSoonAlert = (featureName: string) => {
    Alert.alert(
      t("common.comingSoon"),
      t("common.featureNotAvailable", { feature: featureName }),
      [{ text: t("common.ok") }]
    );
  };

  const handleRefresh = () => {
    onRefresh();
    Alert.alert(
      "Refresh Triggered",
      "User data has been forcibly refreshed from the server."
    );
  };

  // AUTHENTICATED USER SECTIONS
  const getAuthenticatedSections = () => {
    const sections = [];

    // Account Settings (only for authenticated users)
    const accountSettings: SettingsItem[] = [
      {
        id: "personal",
        icon: "person-outline",
        title: t("features.account.profile.personalInfo"),
        subtitle: t("features.account.profile.personalInfoDesc"),
        action: () =>
          router.push(
            isHostTab
              ? "/(tabs)/host/profile/personal-info"
              : "/(tabs)/traveler/profile/personal-info"
          ),
      },
      {
        id: "logout",
        icon: "log-out-outline",
        title: t("features.account.profile.signOut"),
        isDanger: true,
        action: onLogout,
      },
    ];

    sections.push(
      <SettingsSection
        key="account"
        title={t("features.account.profile.account")}
        items={accountSettings}
      />
    );

    // Preferences Settings (with host mode toggle for authenticated users)
    const preferenceSettings: SettingsItem[] = [
      {
        id: "language",
        icon: "language-outline",
        title: t("features.account.profile.language"),
        subtitle: getLanguageDisplayName(),
        action: () => {
          const pathname = isHostTab
            ? "/(tabs)/host/profile/[setting]"
            : "/(tabs)/traveler/profile/[setting]";
          console.log("Language navigation - pathname:", pathname, "params:", {
            setting: "language",
          });
          router.push({
            pathname,
            params: { setting: "language" },
          });
        },
      },
      {
        id: "currency",
        icon: "cash-outline",
        title: t("features.account.profile.currency"),
        subtitle: `${currency} (${getSymbol(currency)})`,
        action: () => {
          const pathname = isHostTab
            ? "/(tabs)/host/profile/currency"
            : "/(tabs)/traveler/profile/[setting]";
          console.log("Currency navigation - pathname:", pathname, "params:", {
            setting: "currency",
          });
          router.push({
            pathname,
            params: { setting: "currency" },
          });
        },
      },
      {
        id: "theme",
        icon: isDark ? "moon-outline" : "sunny-outline",
        title: t("features.account.profile.theme"),
        subtitle: t("features.account.profile.themeDesc"),
        action: () => {
          const pathname = isHostTab
            ? "/(tabs)/host/profile/[setting]"
            : "/(tabs)/traveler/profile/[setting]";
          console.log("Theme navigation - pathname:", pathname, "params:", {
            setting: "theme",
          });
          router.push({
            pathname,
            params: { setting: "theme" },
          });
        },
      },
      // Only show the hostMode toggle if user is a host
      ...(isHost
        ? [
            {
              id: "hostMode",
              icon: "swap-horizontal-outline",
              title:
                userRole === "host"
                  ? t("features.account.profile.switchToTraveler")
                  : t("features.account.profile.switchToHost"),
              subtitle: t("features.account.profile.hostModeDesc"),
              action: async () => {
                const newRole = userRole === "host" ? "traveler" : "host";
                await setUserRole(newRole);
              },
            },
          ]
        : []),
      ...(showDevOptions
        ? [
            {
              id: "debug",
              icon: "bug-outline",
              title: "Debug",
              subtitle: "Font testing and debug settings",
              action: () =>
                router.push({
                  pathname: isHostTab
                    ? "/(tabs)/host/profile/[setting]"
                    : "/(tabs)/traveler/profile/[setting]",
                  params: { setting: "debug" },
                }),
            },
          ]
        : []),
    ];

    sections.push(
      <SettingsSection
        key="preferences"
        title={t("features.account.profile.preferences")}
        items={preferenceSettings}
      />
    );

    // Support Settings (full version for authenticated users)
    const supportSettings: SettingsItem[] = [
      {
        id: "help",
        icon: "help-circle-outline",
        title: t("features.account.profile.helpCenter"),
        subtitle: t("features.account.profile.helpCenterDesc"),
        action: () =>
          router.push({
            pathname: isHostTab
              ? "/(tabs)/host/profile/[setting]"
              : "/(tabs)/traveler/profile/[setting]",
            params: { setting: "help-center" },
          }),
      },
      {
        id: "feedback",
        icon: "chatbubble-outline",
        title: t("features.account.profile.giveFeedback"),
        subtitle: t("features.account.profile.giveFeedbackDesc"),
        action: () =>
          router.push(
            isHostTab
              ? "/(tabs)/host/profile/feedback"
              : "/(tabs)/traveler/profile/feedback"
          ),
      },
      {
        id: "resetApp",
        icon: "refresh-circle-outline",
        title: t("features.account.profile.resetApp") || "Reset App Data",
        subtitle:
          t("features.account.profile.resetAppDesc") || "Fix issues by clearing cached data",
        action: () => showCleanSlateAlert(),
      },
      {
        id: "terms",
        icon: "document-text-outline",
        title: t("features.account.profile.termsOfService"),
        subtitle: t("features.account.profile.termsOfServiceDesc"),
        action: () =>
          router.push({
            pathname: isHostTab
              ? "/(tabs)/host/profile/[setting]"
              : "/(tabs)/traveler/profile/[setting]",
            params: { setting: "terms-of-service" },
          }),
      },
    ];

    sections.push(
      <SettingsSection
        key="support"
        title={t("features.account.profile.support")}
        items={supportSettings}
      />
    );

    return sections;
  };

  // UNAUTHENTICATED USER SECTIONS
  const getUnauthenticatedSections = () => {
    const sections = [];

    // Basic Preferences Settings (without host mode toggle)
    const preferenceSettings: SettingsItem[] = [
      {
        id: "language",
        icon: "language-outline",
        title: t("features.account.profile.language"),
        subtitle: getLanguageDisplayName(),
        action: () => {
          console.log(
            "Unauthenticated language navigation - pathname: /(tabs)/traveler/profile/language"
          );
          router.push("/(tabs)/traveler/profile/language");
        },
      },
      {
        id: "currency",
        icon: "cash-outline",
        title: t("features.account.profile.currency"),
        subtitle: `${currency} (${getSymbol(currency)})`,
        action: () => {
          console.log(
            "Unauthenticated currency navigation - pathname: /(tabs)/traveler/profile/currency"
          );
          router.push("/(tabs)/traveler/profile/currency");
        },
      },
      {
        id: "theme",
        icon: isDark ? "moon-outline" : "sunny-outline",
        title: t("features.account.profile.theme"),
        subtitle: t("features.account.profile.themeDesc"),
        action: () => {
          console.log(
            "Unauthenticated theme navigation - pathname: /(tabs)/traveler/profile/theme"
          );
          router.push("/(tabs)/traveler/profile/theme");
        },
      },
    ];

    sections.push(
      <SettingsSection
        key="preferences"
        title={t("features.account.profile.preferences")}
        items={preferenceSettings}
      />
    );

    // Limited Support Settings (without account-specific features)
    const supportSettings: SettingsItem[] = [
      {
        id: "help",
        icon: "help-circle-outline",
        title: t("features.account.profile.helpCenter"),
        subtitle: t("features.account.profile.helpCenterDesc"),
        action: () =>
          router.push({
            pathname: "/(tabs)/traveler/profile/[setting]",
            params: { setting: "help-center" },
          }),
      },
      {
        id: "terms",
        icon: "document-text-outline",
        title: t("features.account.profile.termsOfService"),
        subtitle: t("features.account.profile.termsOfServiceDesc"),
        action: () =>
          router.push({
            pathname: "/(tabs)/traveler/profile/[setting]",
            params: { setting: "terms-of-service" },
          }),
      },
    ];

    sections.push(
      <SettingsSection
        key="support"
        title={t("features.account.profile.support")}
        items={supportSettings}
      />
    );

    return sections;
  };

  // Render sections based on authentication state
  return (
    <>
      {isAuthenticated
        ? getAuthenticatedSections()
        : getUnauthenticatedSections()}
    </>
  );
}
