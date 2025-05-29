/**
 * Language Selection Modal for the Hoy application
 * Allows users to change the app language and interface localization
 * Supports multiple languages with native names and flag indicators
 */

// React Native core
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Expo and third-party libraries
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

// App context and hooks
import { useTheme } from "@common/context/ThemeContext";

// Components
import BottomSheetModal from "@common/components/BottomSheetModal";

// Constants
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

// Localization
import i18n from "@common/locales/i18n";

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
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);

    // Close modal and return to previous screen
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <BottomSheetModal
      title={t("settings.selectLanguage")}
      showSaveButton={false}
    >
      <View style={styles.container}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              {
                backgroundColor: isDark
                  ? theme.colors.primaryPalette[200]
                  : theme.colors.primary,
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[300],
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
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
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

