/**
 * ProfileSection component
 * Consolidated component that combines all account section components
 * Renders different sections based on authentication state and user preferences
 */

import React from "react";
import { Alert, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

// Base Components
import SettingsSection from "./SettingsSection";

// Hooks
import { useTheme } from "@core/hooks";
import { useUserRole, useCurrency } from "@core/context";

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
  const { userRole, setUserRole, isRoleLoading } = useUserRole();

  const isHost = userRole === "host";

  // Helper functions
  const toggleUserRole = () => {
    const newRole = userRole === "host" ? "traveler" : "host";
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

  // Account Settings (only for authenticated users)
  const accountSettings: SettingsItem[] = isAuthenticated
    ? [
        {
          id: "personal",
          icon: "person-outline",
          title: t("profile.personalInfo"),
          action: () => router.push("/account/personal-info"),
        },
        {
          id: "logout",
          icon: "log-out-outline",
          title: t("profile.signOut"),
          isDanger: true,
          action: onLogout,
        },
      ]
    : [];

  // Preferences Settings
  const preferenceSettings: SettingsItem[] = [
    {
      id: "language",
      icon: "language-outline",
      title: t("profile.language"),
      subtitle: getLanguageDisplayName(),
      action: () => router.push("/(overlays)/common/language"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("profile.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => router.push("/(overlays)/common/currency"),
    },
    {
      id: "theme",
      icon: isDark ? "moon-outline" : "sunny-outline",
      title: t("profile.theme"),
      subtitle:
        mode === "system"
          ? t("profile.themeSystem")
          : isDark
          ? t("profile.themeDark")
          : t("profile.themeLight"),
      action: () => toggleTheme(),
      rightElement: (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primaryPalette[500],
          }}
          thumbColor={theme.white}
        />
      ),
    },
    // Only show host mode toggle for authenticated users
    ...(isAuthenticated
      ? [
          {
            id: "hostMode",
            icon: "home-outline",
            title: t("profile.hostMode"),
            subtitle: isHost
              ? t("profile.hostModeOn")
              : t("profile.hostModeOff"),
            action: () => toggleUserRole(),
            rightElement: (
              <Switch
                value={isHost}
                onValueChange={toggleUserRole}
                trackColor={{
                  false: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                  true: theme.colors.primaryPalette[500],
                }}
                thumbColor={theme.white}
                disabled={isRoleLoading}
              />
            ),
          },
        ]
      : []),
  ];

  // Support Settings
  const supportSettings: SettingsItem[] = [
    {
      id: "help",
      icon: "help-circle-outline",
      title: t("profile.helpCenter"),
      action: () => showComingSoonAlert(t("profile.helpCenter")),
    },
    {
      id: "feedback",
      icon: "chatbubble-outline",
      title: t("profile.giveFeedback"),
      action: () => showComingSoonAlert(t("profile.giveFeedback")),
    },
    {
      id: "resetApp",
      icon: "refresh-circle-outline",
      title: t("profile.resetApp") || "Reset App Data",
      subtitle:
        t("profile.resetAppDesc") || "Fix issues by clearing cached data",
      action: () => showCleanSlateAlert(),
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: t("profile.termsOfService"),
      action: () => showComingSoonAlert(t("profile.termsOfService")),
    },
    // Developer options (if enabled)
    ...(showDevOptions
      ? [
          {
            id: "dev-refresh",
            icon: "refresh-circle-outline",
            title: "🛠️ Force Refresh User Data",
            subtitle: `Last refresh: ${new Date(
              lastRefresh
            ).toLocaleTimeString()}`,
            action: handleRefresh,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Account Settings Section - Only for authenticated users */}
      {isAuthenticated && accountSettings.length > 0 && (
        <SettingsSection title={t("profile.account")} items={accountSettings} />
      )}

      {/* Preferences Section */}
      <SettingsSection
        title={t("profile.preferences")}
        items={preferenceSettings}
      />

      {/* Support Section */}
      <SettingsSection title={t("profile.support")} items={supportSettings} />
    </>
  );
}
