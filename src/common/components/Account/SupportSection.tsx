/**
 * SupportSection component
 * Support and help-related settings
 */

import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

// Components
import SettingsSection, { SettingsItem } from "./SettingsSection";

// Utils
import { showCleanSlateAlert } from "@common/utils/network/cacheBuster";

interface SupportSectionProps {
  showDevOptions: boolean;
  lastRefresh: number;
  onRefresh: () => void;
}

export default function SupportSection({
  showDevOptions,
  lastRefresh,
  onRefresh,
}: SupportSectionProps) {
  const { t } = useTranslation();

  // Show "coming soon" alert for unimplemented features
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

  const supportSettings: SettingsItem[] = [
    {
      id: "help",
      icon: "help-circle-outline",
      title: t("account.helpCenter"),
      action: () => showComingSoonAlert(t("account.helpCenter")),
    },
    {
      id: "feedback",
      icon: "chatbubble-outline",
      title: t("account.giveFeedback"),
      action: () => showComingSoonAlert(t("account.giveFeedback")),
    },
    {
      id: "resetApp",
      icon: "refresh-circle-outline",
      title: t("account.resetApp") || "Reset App Data",
      subtitle:
        t("account.resetAppDesc") || "Fix issues by clearing cached data",
      action: () => showCleanSlateAlert(),
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: t("account.termsOfService"),
      action: () => showComingSoonAlert(t("account.termsOfService")),
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
    <SettingsSection title={t("account.support")} items={supportSettings} />
  );
}
