/**
 * Host Preferences Step Component
 * Handles response time, instant booking, languages, and notification preferences
 * Following Airbnb's preferences setup pattern with clear options and explanations
 */

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Icon, Input } from "@shared/components";
import { spacing, radius } from "@core/design";
import type { HostPreferences } from "@core/types/host.types";

interface HostPreferencesStepProps {
  data: Partial<HostPreferences>;
  errors: Record<string, string>;
  onChange: (data: Partial<HostPreferences>) => void;
}

interface PreferenceCardProps {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container
      backgroundColor="surface"
      borderRadius="lg"
      padding="lg"
      marginBottom="lg"
      borderWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      style={styles.preferenceCard}
    >
      <Container flexDirection="row" alignItems="center" marginBottom="md">
        <Container
          width={48}
          height={48}
          borderRadius="md"
          backgroundColor={
            isDark ? theme.colors.gray[800] : theme.colors.gray[100]
          }
          justifyContent="center"
          alignItems="center"
          marginRight="md"
        >
          <Icon name={icon as any} size={24} color={theme.colors.primary} />
        </Container>

        <Container flex={1}>
          <Text variant="h3" color="primary" marginBottom="xs">
            {title}
          </Text>
          <Text variant="body" color="secondary" style={{ lineHeight: 18 }}>
            {subtitle}
          </Text>
        </Container>
      </Container>

      {children}
    </Container>
  );
};

interface OptionSelectorProps {
  options: Array<{
    value: string;
    label: string;
    description?: string;
    recommended?: boolean;
  }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Container>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={[
            styles.optionItem,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[50],
              borderColor:
                selectedValue === option.value
                  ? theme.colors.primary
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              borderWidth: selectedValue === option.value ? 2 : 1,
            },
          ]}
        >
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Container flex={1}>
              <Container
                flexDirection="row"
                alignItems="center"
                marginBottom="xs"
              >
                <Text variant="subtitle" color="primary">
                  {option.label}
                </Text>
                {option.recommended && (
                  <Container
                    backgroundColor={theme.colors.success}
                    borderRadius="sm"
                    paddingHorizontal="xs"
                    paddingVertical="xxs"
                    marginLeft="sm"
                  >
                    <Text
                      variant="caption"
                      color="white"
                      style={{ fontSize: 9 }}
                    >
                      {t("host.preferences.recommended")}
                    </Text>
                  </Container>
                )}
              </Container>
              {option.description && (
                <Text
                  variant="body"
                  color="secondary"
                  style={{ fontSize: 13, lineHeight: 16 }}
                >
                  {option.description}
                </Text>
              )}
            </Container>

            <Container
              width={20}
              height={20}
              borderRadius="circle"
              borderWidth={2}
              borderColor={
                selectedValue === option.value
                  ? theme.colors.primary
                  : theme.colors.gray[400]
              }
              backgroundColor={
                selectedValue === option.value
                  ? theme.colors.primary
                  : "transparent"
              }
              justifyContent="center"
              alignItems="center"
            >
              {selectedValue === option.value && (
                <Icon name="checkmark" size={12} color="white" />
              )}
            </Container>
          </Container>
        </TouchableOpacity>
      ))}
    </Container>
  );
};

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "so", name: "Soomaali" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
  ];

  const toggleLanguage = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      onLanguagesChange(
        selectedLanguages.filter((lang) => lang !== languageCode)
      );
    } else {
      onLanguagesChange([...selectedLanguages, languageCode]);
    }
  };

  return (
    <Container>
      <Container
        flexDirection="row"
        flexWrap="wrap"
        style={{ gap: spacing.sm }}
      >
        {availableLanguages.map((language) => {
          const isSelected = selectedLanguages.includes(language.code);
          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => toggleLanguage(language.code)}
              style={[
                styles.languageChip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isSelected
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                },
              ]}
            >
              <Text
                variant="body"
                color={isSelected ? "white" : "primary"}
                style={{ fontSize: 14 }}
              >
                {language.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Container>
    </Container>
  );
};

export const HostPreferencesStep: React.FC<HostPreferencesStepProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handlePreferenceChange = (field: keyof HostPreferences, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleNotificationChange = (
    field: keyof HostPreferences["notifications"],
    value: boolean
  ) => {
    onChange({
      ...data,
      notifications: {
        ...data.notifications,
        [field]: value,
      },
    });
  };

  const responseTimeOptions = [
    {
      value: "within_1_hour",
      label: t("host.preferences.responseTime.within1Hour"),
      description: t("host.preferences.responseTime.within1HourDesc"),
      recommended: true,
    },
    {
      value: "within_24_hours",
      label: t("host.preferences.responseTime.within24Hours"),
      description: t("host.preferences.responseTime.within24HoursDesc"),
    },
    {
      value: "within_48_hours",
      label: t("host.preferences.responseTime.within48Hours"),
      description: t("host.preferences.responseTime.within48HoursDesc"),
    },
  ];

  const currentNotifications = data.notifications || {
    email: true,
    push: true,
    sms: false,
    bookingRequests: true,
    messages: true,
    reviews: true,
    payments: true,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container paddingHorizontal="lg" paddingVertical="md">
        <Text variant="h2" color="primary" marginBottom="sm">
          {t("host.preferences.title")}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="xl"
          style={{ lineHeight: 22 }}
        >
          {t("host.preferences.subtitle")}
        </Text>

        {/* Response Time */}
        <PreferenceCard
          title={t("host.preferences.responseTime.title")}
          subtitle={t("host.preferences.responseTime.subtitle")}
          icon="time-outline"
        >
          <OptionSelector
            options={responseTimeOptions}
            selectedValue={data.responseTime || "within_24_hours"}
            onSelect={(value) => handlePreferenceChange("responseTime", value)}
          />
        </PreferenceCard>

        {/* Instant Booking */}
        <PreferenceCard
          title={t("host.preferences.instantBooking.title")}
          subtitle={t("host.preferences.instantBooking.subtitle")}
          icon="flash-outline"
        >
          <Container
            backgroundColor={
              isDark ? theme.colors.gray[800] : theme.colors.gray[50]
            }
            borderRadius="md"
            padding="md"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Container flex={1}>
              <Text variant="subtitle" color="primary" marginBottom="xs">
                {t("host.preferences.instantBooking.enable")}
              </Text>
              <Text
                variant="body"
                color="secondary"
                style={{ fontSize: 13, lineHeight: 16 }}
              >
                {t("host.preferences.instantBooking.description")}
              </Text>
            </Container>

            <Switch
              value={data.instantBooking || false}
              onValueChange={(value) =>
                handlePreferenceChange("instantBooking", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </Container>
        </PreferenceCard>

        {/* Booking Settings */}
        <PreferenceCard
          title={t("host.preferences.bookingSettings.title")}
          subtitle={t("host.preferences.bookingSettings.subtitle")}
          icon="calendar-outline"
        >
          <Container style={{ gap: spacing.md }}>
            <Container flexDirection="row" style={{ gap: spacing.md }}>
              <Container flex={1}>
                <Input
                  label={t("host.preferences.bookingSettings.minimumNotice")}
                  value={data.minimumNotice?.toString() || ""}
                  onChangeText={(value) =>
                    handlePreferenceChange(
                      "minimumNotice",
                      parseInt(value) || 0
                    )
                  }
                  placeholder="24"
                  keyboardType="number-pad"
                  error={errors.minimumNotice}
                />
              </Container>
              <Container flex={1}>
                <Input
                  label={t(
                    "host.preferences.bookingSettings.maxAdvanceBooking"
                  )}
                  value={data.maxAdvanceBooking?.toString() || ""}
                  onChangeText={(value) =>
                    handlePreferenceChange(
                      "maxAdvanceBooking",
                      parseInt(value) || 0
                    )
                  }
                  placeholder="365"
                  keyboardType="number-pad"
                  error={errors.maxAdvanceBooking}
                />
              </Container>
            </Container>
          </Container>
        </PreferenceCard>

        {/* Languages */}
        <PreferenceCard
          title={t("host.preferences.languages.title")}
          subtitle={t("host.preferences.languages.subtitle")}
          icon="language-outline"
        >
          <LanguageSelector
            selectedLanguages={data.languages || ["en"]}
            onLanguagesChange={(languages) =>
              handlePreferenceChange("languages", languages)
            }
          />
        </PreferenceCard>

        {/* Currency & Timezone */}
        <PreferenceCard
          title={t("host.preferences.locationSettings.title")}
          subtitle={t("host.preferences.locationSettings.subtitle")}
          icon="globe-outline"
        >
          <Container style={{ gap: spacing.md }}>
            <Input
              label={t("host.preferences.locationSettings.currency")}
              value={data.currency || ""}
              onChangeText={(value) =>
                handlePreferenceChange("currency", value)
              }
              placeholder="USD"
              error={errors.currency}
            />
            <Input
              label={t("host.preferences.locationSettings.timezone")}
              value={data.timezone || ""}
              onChangeText={(value) =>
                handlePreferenceChange("timezone", value)
              }
              placeholder="UTC"
              error={errors.timezone}
            />
          </Container>
        </PreferenceCard>

        {/* Notification Preferences */}
        <PreferenceCard
          title={t("host.preferences.notifications.title")}
          subtitle={t("host.preferences.notifications.subtitle")}
          icon="notifications-outline"
        >
          <Container style={{ gap: spacing.sm }}>
            {/* Notification Methods */}
            <Container
              backgroundColor={
                isDark ? theme.colors.gray[800] : theme.colors.gray[50]
              }
              borderRadius="md"
              padding="md"
            >
              <Text variant="subtitle" color="primary" marginBottom="md">
                {t("host.preferences.notifications.methods")}
              </Text>

              <Container style={{ gap: spacing.sm }}>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.email")}
                  </Text>
                  <Switch
                    value={currentNotifications.email}
                    onValueChange={(value) =>
                      handleNotificationChange("email", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>

                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.push")}
                  </Text>
                  <Switch
                    value={currentNotifications.push}
                    onValueChange={(value) =>
                      handleNotificationChange("push", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>

                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.sms")}
                  </Text>
                  <Switch
                    value={currentNotifications.sms}
                    onValueChange={(value) =>
                      handleNotificationChange("sms", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>
              </Container>
            </Container>

            {/* Notification Types */}
            <Container
              backgroundColor={
                isDark ? theme.colors.gray[800] : theme.colors.gray[50]
              }
              borderRadius="md"
              padding="md"
            >
              <Text variant="subtitle" color="primary" marginBottom="md">
                {t("host.preferences.notifications.types")}
              </Text>

              <Container style={{ gap: spacing.sm }}>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.bookingRequests")}
                  </Text>
                  <Switch
                    value={currentNotifications.bookingRequests}
                    onValueChange={(value) =>
                      handleNotificationChange("bookingRequests", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>

                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.messages")}
                  </Text>
                  <Switch
                    value={currentNotifications.messages}
                    onValueChange={(value) =>
                      handleNotificationChange("messages", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>

                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.reviews")}
                  </Text>
                  <Switch
                    value={currentNotifications.reviews}
                    onValueChange={(value) =>
                      handleNotificationChange("reviews", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>

                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text variant="body" color="primary">
                    {t("host.preferences.notifications.payments")}
                  </Text>
                  <Switch
                    value={currentNotifications.payments}
                    onValueChange={(value) =>
                      handleNotificationChange("payments", value)
                    }
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </Container>
              </Container>
            </Container>
          </Container>
        </PreferenceCard>

        {/* Summary */}
        <Container
          backgroundColor="surface"
          borderRadius="md"
          padding="md"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container flexDirection="row" alignItems="center" marginBottom="sm">
            <Icon
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="subtitle" color="primary" marginLeft="sm">
              {t("host.preferences.summary.title")}
            </Text>
          </Container>
          <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {t("host.preferences.summary.description")}
          </Text>
        </Container>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preferenceCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionItem: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  languageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
