/**
 * Dynamic Settings Screen Component
 * Handles different types of settings screens dynamically based on the setting type
 */

import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Components
import { Screen, Container, LoadingSkeleton, Text } from "@shared/components";
import {
  CurrencyModal,
  LanguageModal,
} from "@shared/components/overlay/SettingsModals";

// Settings Components
import {
  settingConfigs,
  ThemeSetting,
  CurrencySetting,
  LanguageSetting,
  PersonalInfoSetting,
  InfoSetting,
  DebugSetting,
} from "./settings";

// Hooks
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useToast } from "@core/context";

// Constants
import { spacing } from "@core/design";

interface DynamicSettingsScreenProps {
  settingType: string;
}

export function DynamicSettingsScreen({
  settingType,
}: DynamicSettingsScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  console.log("DynamicSettingsScreen - settingType:", settingType);

  // Modal states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const config = settingConfigs[settingType as keyof typeof settingConfigs];

  console.log("DynamicSettingsScreen - config:", config);

  // Reset modal states when setting type changes
  useEffect(() => {
    setShowCurrencyModal(false);
    setShowLanguageModal(false);
  }, [settingType]);

  if (!config) {
    return (
      <Screen>
        <Container flex={1} justifyContent="center" alignItems="center">
          <Text variant="h6">Setting not found</Text>
        </Container>
      </Screen>
    );
  }

  // Handle currency selection
  const handleCurrencySelected = (selectedCurrency: string) => {
    console.log("Currency selected:", selectedCurrency);
    setShowCurrencyModal(false);
    showToast({
      type: "success",
      message: t("features.profile.currencyChanged", { currency: selectedCurrency }),
    });
  };

  // Handle language selection
  const handleLanguageSelected = (selectedLanguage: string) => {
    console.log("Language selected:", selectedLanguage);
    setShowLanguageModal(false);
  };

  return (
    <>
      <Screen
        header={{
          title: t(config.title),
          left: { icon: "chevron-back-outline", onPress: () => router.back() },
          showDivider: false,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Currency Setting */}
          {config.type === "modal" && config.modalType === "currency" && (
            <CurrencySetting
              title={config.title}
              description={config.description}
              infoContent={config.infoDescription}
              onCurrencyChange={handleCurrencySelected}
            />
          )}

          {/* Language Setting */}
          {config.type === "modal" && config.modalType === "language" && (
            <LanguageSetting
              title={config.title}
              description={config.description}
              infoContent={config.infoDescription}
              onLanguageChange={handleLanguageSelected}
              onOpenModal={() => setShowLanguageModal(true)}
            />
          )}

          {/* Personal Info Form */}
          {config.type === "form" && (
            <PersonalInfoSetting
              title={config.title}
              description={config.description}
              infoContent={config.infoDescription}
            />
          )}

          {/* Theme Setting */}
          {config.type === "theme" && (
            <ThemeSetting
              title={t(config.infoTitle)}
              description={t(config.infoDescription)}
              infoContent={t(config.infoDescription)}
            />
          )}

          {/* Debug settings */}
          {config.type === "debug" && (
            <DebugSetting
              title={config.title}
              description={config.description}
              infoContent={config.infoDescription}
            />
          )}

          {/* Info-only settings */}
          {config.type === "info" && (
            <InfoSetting
              title={config.title}
              description={config.description}
              infoContent={config.infoDescription}
              settingType={settingType}
            />
          )}
        </ScrollView>
      </Screen>

      {/* Currency Modal - Only show for currency settings */}
      {config.type === "modal" && config.modalType === "currency" && (
        <CurrencyModal
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          onCurrencySelected={handleCurrencySelected}
        />
      )}

      {/* Language Modal - Only show for language settings */}
      {config.type === "modal" && config.modalType === "language" && (
        <LanguageModal
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          onLanguageSelected={handleLanguageSelected}
        />
      )}
    </>
  );
}
