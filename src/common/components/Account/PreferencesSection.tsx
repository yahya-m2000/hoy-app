/**
 * PreferencesSection component
 * Handles language and currency settings with integrated modals
 */

import React, { useState } from "react";
import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { useUserRole } from "@common/context/UserRoleContext";
import { useCurrency } from "@common/hooks/useCurrency";

// Components
import SettingsSection, { SettingsItem } from "./SettingsSection";
import LanguageModal from "./LanguageModal";
import CurrencyModal from "./CurrencyModal";

interface PreferencesSectionProps {
  isAuthenticated: boolean;
}

export default function PreferencesSection({
  isAuthenticated,
}: PreferencesSectionProps) {
  const { theme, isDark, toggleTheme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { currency, getSymbol } = useCurrency();
  const { isHost, toggleUserRole, isRoleLoading } = useUserRole();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

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

  const preferenceSettings: SettingsItem[] = [
    {
      id: "language",
      icon: "language-outline",
      title: t("account.language"),
      subtitle: getLanguageDisplayName(),
      action: () => setShowLanguageModal(true),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => setShowCurrencyModal(true),
    },
    {
      id: "theme",
      icon: isDark ? "moon-outline" : "sunny-outline",
      title: t("account.theme"),
      subtitle:
        mode === "system"
          ? t("account.themeSystem")
          : isDark
          ? t("account.themeDark")
          : t("account.themeLight"),
      action: () => toggleTheme(),
      rightElement: (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primary[500],
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
            title: t("account.hostMode"),
            subtitle: isHost
              ? t("account.hostModeOn")
              : t("account.hostModeOff"),
            action: () => toggleUserRole(),
            rightElement: (
              <Switch
                value={isHost}
                onValueChange={toggleUserRole}
                trackColor={{
                  false: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.white}
                disabled={isRoleLoading}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <SettingsSection
        title={t("account.preferences")}
        items={preferenceSettings}
      />

      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </>
  );
}
