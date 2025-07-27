/**
 * Language Setting Component
 * Handles language display and selection
 */

import React from "react";
import { useTranslation } from "react-i18next";

import { Container, Text, Button, Icon } from "@shared/components";
import { iconSize } from "@core/design";

interface LanguageDisplayProps {
  languageName: string;
  languageCode: string;
}

const LanguageDisplay: React.FC<LanguageDisplayProps> = ({
  languageName,
  languageCode,
}) => {
  const { t } = useTranslation();

  return (
    <Container marginBottom="lg">
      <Text variant="h6" marginBottom="sm">
        {t("features.profile.currentLanguage")}
      </Text>
      <Container
        flexDirection="row"
        alignItems="center"
        padding="md"
        borderRadius="md"
        marginBottom="md"
      >
        <Icon name="language-outline" size={iconSize.sm} />
        <Container marginLeft="md">
          <Text variant="h6">{languageName}</Text>
          <Text variant="body2" color="secondary">
            {languageCode?.toUpperCase() || "English"}
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

interface LanguageSettingProps {
  title: string;
  description: string;
  infoContent: string;
  onLanguageChange: (language: string) => void;
  onOpenModal: () => void;
}

export const LanguageSetting: React.FC<LanguageSettingProps> = ({
  title,
  description,
  infoContent,
  onLanguageChange,
  onOpenModal,
}) => {
  const { t, i18n } = useTranslation();

  // Get current language display name
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

  return (
    <Container marginBottom="xl">
      <Container marginBottom="lg">
        <Text variant="h6" marginBottom="sm">
          {t(title)}
        </Text>
        <Text variant="body2" color="secondary" marginBottom="lg">
          {t(description)}
        </Text>
      </Container>

      <LanguageDisplay
        languageName={getLanguageDisplayName()}
        languageCode={i18n.language}
      />

      <Button
        title={t("features.profile.selectLanguage")}
        onPress={onOpenModal}
        variant="primary"
      />

      <Container marginTop="xl">
        <Text variant="body2" color="secondary">
          {t(infoContent)}
        </Text>
      </Container>
    </Container>
  );
};
