/**
 * Default Policies Step Component
 * Handles cancellation policy selection and house rules configuration in the host setup flow
 * Following Airbnb's policy setup pattern with intuitive selectors and clear explanations
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Icon, Input } from "@shared/components";
import { spacing, radius } from "@core/design";
import type {
  HostDefaultPolicies,
  HostCancellationPolicy,
  HostHouseRules,
  CheckInPreferences,
} from "@core/types/host.types";

interface DefaultPoliciesStepProps {
  data: Partial<HostDefaultPolicies>;
  errors: Record<string, string>;
  onChange: (data: Partial<HostDefaultPolicies>) => void;
}

interface PolicyTypeCardProps {
  type: "flexible" | "moderate" | "strict";
  title: string;
  subtitle: string;
  refundDetails: string;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
}

const PolicyTypeCard: React.FC<PolicyTypeCardProps> = ({
  type,
  title,
  subtitle,
  refundDetails,
  isSelected,
  onSelect,
  isRecommended = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Container
      backgroundColor="surface"
      borderRadius="lg"
      padding="lg"
      marginBottom="md"
      borderWidth={2}
      borderColor={
        isSelected
          ? theme.colors.primary
          : isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200]
      }
      // style={[
      //   styles.policyCard,
      //   isSelected && {
      //     backgroundColor: isDark
      //       ? theme.colors.gray[800]
      //       : theme.colors.primary + "10",
      //   },
      // ]}
    >
      <Container flexDirection="row" alignItems="flex-start" marginBottom="md">
        <Container flex={1}>
          <Container flexDirection="row" alignItems="center" marginBottom="sm">
            <Text variant="h3" color="primary" style={{ flex: 1 }}>
              {title}
            </Text>
            {isRecommended && (
              <Container
                backgroundColor={theme.colors.success}
                borderRadius="sm"
                paddingHorizontal="sm"
                paddingVertical="xs"
              >
                <Text variant="caption" color="white" style={{ fontSize: 10 }}>
                  {t("features.host.setup.policies.recommended")}
                </Text>
              </Container>
            )}
          </Container>

          <Text
            variant="body"
            color="secondary"
            marginBottom="md"
            style={{ lineHeight: 20 }}
          >
            {subtitle}
          </Text>

          <Text
            variant="body"
            color="primary"
            style={{ lineHeight: 18, fontSize: 14 }}
          >
            {refundDetails}
          </Text>
        </Container>

        <Container
          width={24}
          height={24}
          borderRadius="circle"
          borderWidth={2}
          borderColor={
            isSelected ? theme.colors.primary : theme.colors.gray[400]
          }
          backgroundColor={isSelected ? theme.colors.primary : "transparent"}
          justifyContent="center"
          alignItems="center"
          marginLeft="md"
        >
          {isSelected && <Icon name="checkmark" size={14} color="white" />}
        </Container>
      </Container>

      <Button
        title={
          isSelected ? t("features.host.setup.policies.selected") : t("features.host.setup.policies.select")
        }
        variant={isSelected ? "outline" : "primary"}
        onPress={onSelect}
        disabled={isSelected}
        style={{ alignSelf: "flex-start" }}
      />
    </Container>
  );
};

interface HouseRuleToggleProps {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  icon: string;
}

const HouseRuleToggle: React.FC<HouseRuleToggleProps> = ({
  title,
  subtitle,
  value,
  onToggle,
  icon,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container
      backgroundColor="surface"
      borderRadius="md"
      padding="md"
      marginBottom="sm"
      borderWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      flexDirection="row"
      alignItems="center"
    >
      <Container
        width={40}
        height={40}
        borderRadius="md"
        backgroundColor={
          isDark ? theme.colors.gray[800] : theme.colors.gray[100]
        }
        justifyContent="center"
        alignItems="center"
        marginRight="md"
      >
        <Icon name={icon as any} size={20} color={theme.colors.primary} />
      </Container>

      <Container flex={1}>
        <Text variant="subtitle" color="primary" marginBottom="sm">
          {title}
        </Text>
        <Text
          variant="body"
          color="secondary"
          style={{ fontSize: 13, lineHeight: 16 }}
        >
          {subtitle}
        </Text>
      </Container>

      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.gray[300],
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.white}
      />
    </Container>
  );
};

export const DefaultPoliciesStep: React.FC<DefaultPoliciesStepProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handleCancellationPolicyChange = (
    type: "flexible" | "moderate" | "strict"
  ) => {
    const policyConfigs = {
      flexible: {
        type: "flexible" as const,
        refundPeriodDays: 1,
        fullRefundDays: 1,
        partialRefundDays: 0,
        noRefundDays: 0,
        partialRefundPercentage: 50,
      },
      moderate: {
        type: "moderate" as const,
        refundPeriodDays: 5,
        fullRefundDays: 5,
        partialRefundDays: 1,
        noRefundDays: 0,
        partialRefundPercentage: 50,
      },
      strict: {
        type: "strict" as const,
        refundPeriodDays: 14,
        fullRefundDays: 14,
        partialRefundDays: 7,
        noRefundDays: 0,
        partialRefundPercentage: 50,
      },
    };

    onChange({
      ...data,
      cancellationPolicy: policyConfigs[type],
    });
  };

  const handleHouseRulesChange = (field: keyof HostHouseRules, value: any) => {
    onChange({
      ...data,
      houseRules: {
        ...data.houseRules,
        [field]: value,
      } as HostHouseRules,
    });
  };

  const handleCheckInPreferencesChange = (
    field: keyof CheckInPreferences,
    value: any
  ) => {
    onChange({
      ...data,
      checkInPreferences: {
        ...data.checkInPreferences,
        [field]: value,
      } as CheckInPreferences,
    });
  };

  const handleTimeChange = (
    field: "checkInTime" | "checkOutTime",
    value: string
  ) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(value) || value === "") {
      handleHouseRulesChange(field, value);
    }
  };

  const handleQuietHoursChange = (field: "start" | "end", value: string) => {
    const currentQuietHours = data.houseRules?.quietHours || {
      enabled: false,
      start: "22:00",
      end: "08:00",
    };
    handleHouseRulesChange("quietHours", {
      ...currentQuietHours,
      [field]: value,
    });
  };

  const currentPolicy = data.cancellationPolicy?.type || "moderate";
  const currentHouseRules = data.houseRules || {
    checkInTime: "",
    checkOutTime: "",
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    quietHours: { enabled: false, start: "", end: "" },
    additionalRules: [],
  } as HostHouseRules;
  const currentCheckInPrefs = data.checkInPreferences || {
    selfCheckIn: false,
    keyPickup: false,
    meetAndGreet: false,
  } as CheckInPreferences;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container paddingHorizontal="lg" paddingVertical="md">
        <Text variant="h2" color="primary" marginBottom="sm">
          {t("features.host.setup.policies.defaultPolicies.title")}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="xl"
          style={{ lineHeight: 22 }}
        >
          {t("features.host.setup.policies.defaultPolicies.subtitle")}
        </Text>

        {/* Cancellation Policy Section */}
        <Container marginBottom="xl">
          <Text variant="h3" color="primary" marginBottom="md">
            {t("features.host.setup.policies.cancellation.title")}
          </Text>

          <Text
            variant="body"
            color="secondary"
            marginBottom="lg"
            style={{ lineHeight: 20 }}
          >
            {t("features.host.setup.policies.cancellation.description")}
          </Text>

          <PolicyTypeCard
            type="flexible"
            title={t("features.host.setup.policies.cancellation.flexible.title")}
            subtitle={t("features.host.setup.policies.cancellation.flexible.subtitle")}
            refundDetails={t("features.host.setup.policies.cancellation.flexible.details")}
            isSelected={currentPolicy === "flexible"}
            onSelect={() => handleCancellationPolicyChange("flexible")}
          />

          <PolicyTypeCard
            type="moderate"
            title={t("features.host.setup.policies.cancellation.moderate.title")}
            subtitle={t("features.host.setup.policies.cancellation.moderate.subtitle")}
            refundDetails={t("features.host.setup.policies.cancellation.moderate.details")}
            isSelected={currentPolicy === "moderate"}
            onSelect={() => handleCancellationPolicyChange("moderate")}
            isRecommended={true}
          />

          <PolicyTypeCard
            type="strict"
            title={t("features.host.setup.policies.cancellation.strict.title")}
            subtitle={t("features.host.setup.policies.cancellation.strict.subtitle")}
            refundDetails={t("features.host.setup.policies.cancellation.strict.details")}
            isSelected={currentPolicy === "strict"}
            onSelect={() => handleCancellationPolicyChange("strict")}
          />
        </Container>

        {/* House Rules Section */}
        <Container marginBottom="xl">
          <Text variant="h3" color="primary" marginBottom="md">
            {t("features.host.setup.policies.houseRules.title")}
          </Text>

          <Text
            variant="body"
            color="secondary"
            marginBottom="lg"
            style={{ lineHeight: 20 }}
          >
            {t("features.host.setup.policies.houseRules.description")}
          </Text>

          {/* Check-in/Check-out Times */}
          <Container marginBottom="lg">
            <Text variant="subtitle" color="primary" marginBottom="md">
              {t("features.host.setup.policies.houseRules.checkInOut")}
            </Text>

            <Container flexDirection="row" style={{ gap: spacing.md }}>
              <Container flex={1}>
                <Input
                  label={t("features.host.setup.policies.houseRules.checkInTime")}
                  value={currentHouseRules.checkInTime || ""}
                  onChangeText={(value) =>
                    handleTimeChange("checkInTime", value)
                  }
                  placeholder="15:00"
                  error={errors.checkInTime}
                />
              </Container>
              <Container flex={1}>
                <Input
                  label={t("features.host.setup.policies.houseRules.checkOutTime")}
                  value={currentHouseRules.checkOutTime || ""}
                  onChangeText={(value) =>
                    handleTimeChange("checkOutTime", value)
                  }
                  placeholder="11:00"
                  error={errors.checkOutTime}
                />
              </Container>
            </Container>
          </Container>

          {/* House Rules Toggles */}
          <HouseRuleToggle
            title={t("features.host.setup.policies.houseRules.smoking.title")}
            subtitle={t("features.host.setup.policies.houseRules.smoking.subtitle")}
            value={currentHouseRules.smokingAllowed || false}
            onToggle={(value) =>
              handleHouseRulesChange("smokingAllowed", value)
            }
            icon="ban-outline"
          />

          <HouseRuleToggle
            title={t("features.host.setup.policies.houseRules.pets.title")}
            subtitle={t("features.host.setup.policies.houseRules.pets.subtitle")}
            value={currentHouseRules.petsAllowed || false}
            onToggle={(value) => handleHouseRulesChange("petsAllowed", value)}
            icon="paw-outline"
          />

          <HouseRuleToggle
            title={t("features.host.setup.policies.houseRules.parties.title")}
            subtitle={t("features.host.setup.policies.houseRules.parties.subtitle")}
            value={currentHouseRules.partiesAllowed || false}
            onToggle={(value) =>
              handleHouseRulesChange("partiesAllowed", value)
            }
            icon="musical-notes-outline"
          />

          {/* Quiet Hours */}
          <Container marginBottom="lg">
            <HouseRuleToggle
              title={t("features.host.setup.policies.houseRules.quietHours.title")}
              subtitle={t("features.host.setup.policies.houseRules.quietHours.subtitle")}
              value={currentHouseRules.quietHours?.enabled || false}
              onToggle={(value) =>
                handleHouseRulesChange("quietHours", {
                  ...currentHouseRules.quietHours,
                  enabled: value,
                  start: currentHouseRules.quietHours?.start || "22:00",
                  end: currentHouseRules.quietHours?.end || "08:00",
                })
              }
              icon="moon-outline"
            />

            {currentHouseRules.quietHours?.enabled && (
              <Container
                marginTop="md"
                paddingHorizontal="md"
                flexDirection="row"
                style={{ gap: spacing.md }}
              >
                <Container flex={1}>
                  <Input
                    label={t("features.host.setup.policies.houseRules.quietHours.start")}
                    value={currentHouseRules.quietHours?.start || "22:00"}
                    onChangeText={(value) =>
                      handleQuietHoursChange("start", value)
                    }
                    placeholder="22:00"
                    error={errors.quietHoursStart}
                  />
                </Container>
                <Container flex={1}>
                  <Input
                    label={t("features.host.setup.policies.houseRules.quietHours.end")}
                    value={currentHouseRules.quietHours?.end || "08:00"}
                    onChangeText={(value) =>
                      handleQuietHoursChange("end", value)
                    }
                    placeholder="08:00"
                    error={errors.quietHoursEnd}
                  />
                </Container>
              </Container>
            )}
          </Container>
        </Container>

        {/* Check-in Preferences Section */}
        <Container marginBottom="xl">
          <Text variant="h3" color="primary" marginBottom="md">
            {t("features.host.setup.policies.checkInPreferences.title")}
          </Text>

          <Text
            variant="body"
            color="secondary"
            marginBottom="lg"
            style={{ lineHeight: 20 }}
          >
            {t("features.host.setup.policies.checkInPreferences.description")}
          </Text>

          <HouseRuleToggle
            title={t("features.host.setup.policies.checkInPreferences.selfCheckIn.title")}
            subtitle={t(
              "features.host.setup.policies.checkInPreferences.selfCheckIn.subtitle"
            )}
            value={currentCheckInPrefs.selfCheckIn || false}
            onToggle={(value) =>
              handleCheckInPreferencesChange("selfCheckIn", value)
            }
            icon="key-outline"
          />

          <HouseRuleToggle
            title={t("features.host.setup.policies.checkInPreferences.keyPickup.title")}
            subtitle={t("features.host.setup.policies.checkInPreferences.keyPickup.subtitle")}
            value={currentCheckInPrefs.keyPickup || false}
            onToggle={(value) =>
              handleCheckInPreferencesChange("keyPickup", value)
            }
            icon="location-outline"
          />

          <HouseRuleToggle
            title={t("features.host.setup.policies.checkInPreferences.meetAndGreet.title")}
            subtitle={t(
              "features.host.setup.policies.checkInPreferences.meetAndGreet.subtitle"
            )}
            value={currentCheckInPrefs.meetAndGreet || false}
            onToggle={(value) =>
              handleCheckInPreferencesChange("meetAndGreet", value)
            }
            icon="people-outline"
          />
        </Container>

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
              {t("features.host.setup.policies.summary.title")}
            </Text>
          </Container>
          <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {t("features.host.setup.policies.summary.description")}
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
  policyCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
