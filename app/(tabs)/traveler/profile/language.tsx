/**
 * Language Selection Screen
 * Allows users to select their preferred language
 */

import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@core/hooks/useTheme";
import { useLanguage } from "@core/locales/i18n";
import { Container, Header } from "@shared/components/layout";
import { Text } from "@shared/components/base/Text";
import { fontSize, spacing } from "@core/design";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export default function LanguageScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      // Navigate back after successful language change
      router.back();
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => {
    const isSelected = currentLanguage === item.code;

    return (
      <TouchableOpacity
        onPress={() => handleLanguageSelect(item.code)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        }}
      >
        <Container>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: isSelected ? "600" : "400",
              color: isSelected
                ? theme.colors.primary
                : isDark
                ? theme.colors.white
                : theme.colors.black,
            }}
          >
            {item.nativeName}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
              marginTop: 2,
            }}
          >
            {item.name}
          </Text>
        </Container>

        {isSelected && (
          <Ionicons
            name="checkmark"
            size={24}
            color={theme.colors.primary[600]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Container flex={1} backgroundColor="background">
      <Header title={t("settings.language")} />

      {/* Language List */}
      <FlatList
        data={supportedLanguages}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
        }}
      />
    </Container>
  );
}
