/**
 * Theme Setting Component
 * Handles theme selection and display
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { Container, Text, Icon } from "@shared/components";
import { useTheme } from "@core/hooks";
import { iconSize } from "@core/design";
import { InfoBox } from "src/features/host";

interface ThemeOptionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  title,
  subtitle,
  icon,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Container
        borderRadius="lg"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor={isSelected ? theme.surface : "transparent"}
        marginBottom="md"
        flexDirection="row"
        alignItems="center"
      >
        <Container
          width={40}
          height={40}
          borderRadius="circle"
          justifyContent="center"
          alignItems="center"
        >
          <Icon name={icon} size={iconSize.md} color={theme.text?.primary} />
        </Container>

        <Container flex={1}>
          <Text variant="h6" weight="semibold">
            {title}
          </Text>
          <Text variant="body2" color="secondary">
            {subtitle}
          </Text>
        </Container>

        {isSelected && (
          <Container
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="checkmark" size={iconSize.sm} />
          </Container>
        )}
      </Container>
    </TouchableOpacity>
  );
};

interface ThemeSettingProps {
  title: string;
  description: string;
  infoContent: string;
}

export const ThemeSetting: React.FC<ThemeSettingProps> = ({
  title,
  description,
  infoContent,
}) => {
  const { t } = useTranslation();
  const { mode, setMode, theme } = useTheme();

  const handleThemeSelect = (selectedMode: "system" | "light" | "dark") => {
    setMode(selectedMode);
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

      <Container marginBottom="xl">
        <ThemeOption
          title={t("features.account.profile.themeSystem")}
          subtitle={t("features.account.profile.themeSystemDesc")}
          icon="phone-portrait-outline"
          isSelected={mode === "system"}
          onPress={() => handleThemeSelect("system")}
        />

        <ThemeOption
          title={t("features.account.profile.themeLight")}
          subtitle={t("features.account.profile.themeLightDesc")}
          icon="sunny-outline"
          isSelected={mode === "light"}
          onPress={() => handleThemeSelect("light")}
        />

        <ThemeOption
          title={t("features.account.profile.themeDark")}
          subtitle={t("features.account.profile.themeDarkDesc")}
          icon="moon-outline"
          isSelected={mode === "dark"}
          onPress={() => handleThemeSelect("dark")}
        />
      </Container>

      <InfoBox>
        <Text>{t(infoContent)}</Text>
      </InfoBox>
    </Container>
  );
};
