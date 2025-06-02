/**
 * AccountSection component
 * Account management settings including profile and privacy
 */

import React from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// Components
import SettingsSection, { SettingsItem } from "./SettingsSection";

interface AccountSectionProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function AccountSection({
  isAuthenticated,
  onLogout,
}: AccountSectionProps) {
  const { t } = useTranslation();

  if (!isAuthenticated) {
    // Return empty for non-authenticated users
    return null;
  }

  const accountSettings: SettingsItem[] = [
    {
      id: "personal",
      icon: "person-outline",
      title: t("account.personalInfo"),
      action: () => router.push("/(screens)/common/personal-info"),
    },
    {
      id: "privacy",
      icon: "shield-outline",
      title: t("account.privacySecurity"),
      action: () => router.push("/(screens)/common/privacy-security"),
    },
  ];

  const legalSettings: SettingsItem[] = [
    {
      id: "logout",
      icon: "log-out-outline",
      title: t("account.signOut"),
      isDanger: true,
      action: onLogout,
    },
  ];

  return (
    <>
      <SettingsSection title={t("account.account")} items={accountSettings} />
      <SettingsSection title="" items={legalSettings} />
    </>
  );
}
