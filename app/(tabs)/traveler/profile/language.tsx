/**
 * Language Selection Screen
 * Allows users to select their preferred language
 */

import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@core/hooks/useTheme";
import { useLanguage } from "@core/locales/i18n";
import { Container, Header, Text } from "@shared/components";
import { radius, fontSize, spacing } from "@core/design";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export default function LanguageScreen() {
  const { theme, isDark } = useTheme();
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
          backgroundColor: "transparent",
        }}
        activeOpacity={0.7}
      >
        <Container>
          <Text
            size="md"
            weight={isSelected ? "semibold" : "normal"}
            color={isSelected ? "primary" : "primary"}
            style={{
              marginBottom: 2,
            }}
          >
            {item.nativeName}
          </Text>
          <Text size="sm" weight="normal" color="secondary">
            {item.name}
          </Text>
        </Container>

        {isSelected && (
          <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Container flex={1} backgroundColor="background">
      <Header
        title={t("profile.language")}
        left={{ icon: "arrow-back", onPress: () => router.back() }}
      />

      {/* Language List */}
      <Container flex={1} marginTop="md">
        <FlatList
          data={supportedLanguages}
          keyExtractor={(item) => item.code}
          renderItem={renderLanguageItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: spacing.xl,
          }}
        />
      </Container>
    </Container>
  );
}
