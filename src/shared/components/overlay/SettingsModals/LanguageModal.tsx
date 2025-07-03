/**
 * Language Selection Component
 * Simple component that navigates to language selection screen
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "src/core/hooks/useTheme";
import { useLanguage } from "@core/locales/i18n";
import { Container } from "../../layout";
import { Text } from "../../base/Text";
import { fontSize, spacing } from "@core/design";

interface LanguageModalProps {
  visible?: boolean; // Keep for backward compatibility but ignore
  onClose?: () => void; // Keep for backward compatibility but ignore
}

export default function LanguageModal({
  visible,
  onClose,
}: LanguageModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, supportedLanguages } = useLanguage();

  // Find current language display name
  const currentLang = supportedLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  const handlePress = () => {
    // Close any existing modal first
    if (onClose) {
      onClose();
    }
    // Navigate to language screen
    router.push("/(tabs)/traveler/profile/language");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      }}
    >
      <Container flexDirection="row" alignItems="center">
        <Ionicons
          name="language-outline"
          size={24}
          color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
          style={{ marginRight: spacing.md }}
        />
        <Container>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: "500",
              color: isDark ? theme.colors.white : theme.colors.black,
            }}
          >
            {t("settings.language", "Language")}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              marginTop: 2,
            }}
          >
            {currentLang?.nativeName || "English"}
          </Text>
        </Container>
      </Container>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
      />
    </TouchableOpacity>
  );
}
