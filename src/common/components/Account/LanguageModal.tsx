/**
 * LanguageModal component
 * Modal for selecting app language with i18n integration
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@common/context/ThemeContext";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
  },
];

export default function LanguageModal({
  visible,
  onClose,
}: LanguageModalProps) {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);

      // Save to AsyncStorage
      await AsyncStorage.setItem("@language", languageCode);

      // Update local state
      setCurrentLanguage(languageCode);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
            },
          ]}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isDark
                      ? theme.colors.gray[100]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {t("account.language")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100],
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={
                    isDark ? theme.colors.gray[300] : theme.colors.gray[600]
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.white,
                      borderColor: isDark
                        ? theme.colors.gray[700]
                        : theme.colors.gray[200],
                    },
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <View style={styles.languageText}>
                      <Text
                        style={[
                          styles.languageName,
                          {
                            color: isDark
                              ? theme.colors.gray[100]
                              : theme.colors.gray[900],
                          },
                        ]}
                      >
                        {language.name}
                      </Text>
                      <Text
                        style={[
                          styles.languageNative,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {language.nativeName}
                      </Text>
                    </View>
                  </View>
                  {currentLanguage === language.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary[500]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
  },
  container: {
    maxHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  languageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.xs / 2,
  },
  languageNative: {
    fontSize: fontSize.sm,
  },
});
