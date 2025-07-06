/**
 * Language Modal Component
 * Handles language selection and settings
 * Converted from navigation-based component to standalone modal component
 */

import React, { useState, useEffect } from "react";
import { Modal, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useLanguage } from "@core/locales/i18n";
import i18n from "@core/locales/i18n";

// Components
import { Container } from "../../layout";
import { Button } from "../../base/Button";
import { Text } from "../../base/Text";
import { Ionicons } from "@expo/vector-icons";

// Constants
import { fontSize, spacing } from "@core/design";

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelected?: (language: string) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const supportedLanguages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
];

export default function LanguageModal({
  visible,
  onClose,
  onLanguageSelected,
}: LanguageModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setIsLoading(true);
      setSelectedLanguage(languageCode);

      console.log("Changing language to:", languageCode);
      console.log("Current language before change:", currentLanguage);

      await changeLanguage(languageCode);

      console.log("Language change completed");
      console.log("Current language after change:", i18n.language);

      // Force a small delay to ensure the language change is processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (onLanguageSelected) {
        onLanguageSelected(languageCode);
      }

      onClose();
    } catch (error) {
      console.error("Failed to change language:", error);
      Alert.alert("Error", "Failed to change language. Please try again.");
      setSelectedLanguage(currentLanguage); // Reset selection
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => {
    const isSelected = item.code === selectedLanguage;

    return (
      <TouchableOpacity
        onPress={() => handleLanguageSelect(item.code)}
        disabled={isLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: isSelected
            ? isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100]
            : "transparent",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: isSelected ? "600" : "400",
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
              marginBottom: 2,
            }}
          >
            {item.nativeName}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            }}
          >
            {item.name}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const ModalHeader = () => (
    <Container
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="md"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
      }}
    >
      <View style={{ width: 40 }} />
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: "600",
          color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
        }}
      >
        Language
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        }
      />
    </Container>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <ModalHeader />

        <Container flex={1} style={{ paddingBottom: insets.bottom }}>
          <FlatList
            data={supportedLanguages}
            keyExtractor={(item) => item.code}
            renderItem={renderLanguageItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
          />
        </Container>
      </Container>
    </Modal>
  );
}
