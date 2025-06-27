/**
 * Language Selection Modal for the Hoy application
 * Allows users to change the app language and interface localization
 * Supports multiple languages with native names and flag indicators
 */

// React Native core
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";

// Expo and third-party libraries
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// App context and hooks
import { useTheme } from "@shared/hooks/useTheme";

// Components
import { BottomSheetModal } from "@shared/components";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

// Localization
import i18n from "@shared/locales/i18n";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export default function LanguageModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Available languages
  const languages: LanguageOption[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  ];

  // Current language
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  // Handle language selection
  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);

      // Change language in i18n
      await i18n.changeLanguage(languageCode);

      // Save to AsyncStorage
      await AsyncStorage.setItem("@language", languageCode);

      // Close modal and return to previous screen
      setTimeout(() => {
        router.back();
      }, 300);
    } catch (error) {
      console.error("Failed to change language:", error);
      // Still close modal even if storage fails
      router.back();
    }
  };

  return (
    <BottomSheetModal
      title={t("settings.selectLanguage")}
      showSaveButton={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                {
                  backgroundColor:
                    selectedLanguage === language.code
                      ? isDark
                        ? theme.colors.primaryPalette[200]
                        : theme.colors.primaryPalette[50]
                      : "transparent",
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                },
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageNameContainer}>
                  <Text
                    style={[
                      styles.languageName,
                      {
                        color: isDark
                          ? theme.colors.gray[100]
                          : theme.colors.gray[900],
                        fontWeight:
                          selectedLanguage === language.code ? "600" : "400",
                      },
                    ]}
                  >
                    {language.name}
                  </Text>
                  {language.name !== language.nativeName && (
                    <Text
                      style={[
                        styles.nativeName,
                        {
                          color: isDark
                            ? theme.colors.gray[400]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                  )}
                </View>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  languageNameContainer: {
    flexDirection: "column",
  },
  languageName: {
    fontSize: fontSize.md,
  },
  nativeName: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
