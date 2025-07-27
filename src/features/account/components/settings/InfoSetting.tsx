/**
 * Info Setting Component
 * Handles info-only settings like help center, feedback, terms of service
 */

import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import { Container, Text, Button } from "@shared/components";

interface InfoSettingProps {
  title: string;
  description: string;
  infoContent: string;
  settingType: string;
}

export const InfoSetting: React.FC<InfoSettingProps> = ({
  title,
  description,
  infoContent,
  settingType,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Handle info-only actions
  const handleInfoAction = () => {
    switch (settingType) {
      case "help-center":
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", { feature: t("features.profile.helpCenter") }),
          [{ text: t("common.ok") }]
        );
        break;
      case "feedback":
        router.push("/(tabs)/traveler/profile/feedback");
        break;
      case "terms-of-service":
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", {
            feature: t("features.profile.termsOfService"),
          }),
          [{ text: t("common.ok") }]
        );
        break;
      default:
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", { feature: t(title) }),
          [{ text: t("common.ok") }]
        );
    }
  };

  return (
    <Container>
      <Container marginBottom="xl">
        <Text variant="h6" marginBottom="sm">
          {t(title)}
        </Text>
        <Text variant="body2" color="secondary">
          {t(description)}
        </Text>
      </Container>

      <Button
        title={t("common.comingSoon")}
        onPress={handleInfoAction}
        variant="outline"
      />
    </Container>
  );
};
