/**
 * PolicyTypeSelector Component
 *
 * Selector component for choosing cancellation policy types with detailed explanations.
 * Displays policy options in an intuitive card-based layout.
 *
 * @module @features/host/components/setup
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Icon } from "@shared/components";
import { spacing, radius, iconSize } from "@core/design";

export type PolicyType = "flexible" | "moderate" | "strict" | "custom";

interface PolicyOption {
  type: PolicyType;
  title: string;
  description: string;
  refundDetails: string;
  icon: string;
  recommended?: boolean;
}

interface PolicyTypeSelectorProps {
  selectedType: PolicyType;
  onSelect: (type: PolicyType) => void;
  disabled?: boolean;
  showRecommended?: boolean;
  customOptions?: PolicyOption[];
}

export const PolicyTypeSelector: React.FC<PolicyTypeSelectorProps> = ({
  selectedType,
  onSelect,
  disabled = false,
  showRecommended = true,
  customOptions,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const defaultPolicyOptions: PolicyOption[] = [
    {
      type: "flexible",
      title: t("features.host.setup.policies.flexible.title"),
      description: t("features.host.setup.policies.flexible.description"),
      refundDetails: t("features.host.setup.policies.flexible.refundDetails"),
      icon: "checkmark-circle",
      recommended: true,
    },
    {
      type: "moderate",
      title: t("features.host.setup.policies.moderate.title"),
      description: t("features.host.setup.policies.moderate.description"),
      refundDetails: t("features.host.setup.policies.moderate.refundDetails"),
      icon: "time-outline",
    },
    {
      type: "strict",
      title: t("features.host.setup.policies.strict.title"),
      description: t("features.host.setup.policies.strict.description"),
      refundDetails: t("features.host.setup.policies.strict.refundDetails"),
      icon: "ban-outline",
    },
    {
      type: "custom",
      title: t("features.host.setup.policies.custom.title"),
      description: t("features.host.setup.policies.custom.description"),
      refundDetails: t("features.host.setup.policies.custom.refundDetails"),
      icon: "settings-outline",
    },
  ];

  const policyOptions = customOptions || defaultPolicyOptions;

  const handleSelect = (type: PolicyType) => {
    if (!disabled) {
      onSelect(type);
    }
  };

  const renderPolicyCard = (option: PolicyOption) => {
    const isSelected = selectedType === option.type;
    const isRecommended = option.recommended && showRecommended;

    return (
      <TouchableOpacity
        key={option.type}
        onPress={() => handleSelect(option.type)}
        disabled={disabled}
        style={[
          styles.policyCard,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.white,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.gray[200],
            borderWidth: isSelected ? 2 : 1,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <View
            style={[
              styles.recommendedBadge,
              {
                backgroundColor: theme.colors.success,
              },
            ]}
          >
            <Text
              variant="caption"
              style={[styles.recommendedText, { color: theme.colors.white }]}
            >
              {t("features.host.setup.policies.recommended")}
            </Text>
          </View>
        )}

        {/* Card Header */}
        <Container flexDirection="row" alignItems="center" marginBottom="md">
          {/* Policy Icon */}
          <Container
            style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary + "20"
                  : theme.colors.gray[100],
              },
            ]}
          >
            <Icon
              name={option.icon as any}
              size={iconSize.md}
              color={isSelected ? theme.colors.primary : theme.colors.gray[500]}
            />
          </Container>

          {/* Policy Title */}
          <Container flex={1} paddingLeft="md">
            <Text
              variant="h6"
              color={isSelected ? "primary" : "primary"}
              style={styles.policyTitle}
            >
              {option.title}
            </Text>
          </Container>

          {/* Selection Indicator */}
          <Container>
            <Icon
              name={isSelected ? "radio-button-on" : "radio-button-off"}
              size={iconSize.sm}
              color={isSelected ? theme.colors.primary : theme.colors.gray[400]}
            />
          </Container>
        </Container>

        {/* Policy Description */}
        <Container marginBottom="sm">
          <Text
            variant="body"
            color="secondary"
            style={styles.policyDescription}
          >
            {option.description}
          </Text>
        </Container>

        {/* Refund Details */}
        <Container
          style={[
            styles.refundDetails,
            {
              backgroundColor: isSelected
                ? theme.colors.primary + "10"
                : theme.colors.gray[50],
            },
          ]}
        >
          <Icon
            name="information-circle-outline"
            size={iconSize.xs}
            color={isSelected ? theme.colors.primary : theme.colors.gray[500]}
            style={styles.refundIcon}
          />
          <Text
            variant="caption"
            color={isSelected ? "primary" : "secondary"}
            style={styles.refundText}
          >
            {option.refundDetails}
          </Text>
        </Container>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      {/* Header */}
      <Container marginBottom="lg">
        <Text variant="h5" color="primary" style={styles.sectionTitle}>
          {t("features.host.setup.policies.selectCancellationPolicy")}
        </Text>
        <Text variant="body" color="secondary" style={styles.sectionSubtitle}>
          {t("features.host.setup.policies.selectCancellationPolicyDescription")}
        </Text>
      </Container>

      {/* Policy Options */}
      <Container style={{ gap: spacing.md }}>
        {policyOptions.map(renderPolicyCard)}
      </Container>

      {/* Help Text */}
      <Container
        style={[
          styles.helpContainer,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.info + "10",
          },
        ]}
        marginTop="lg"
      >
        <Icon
          name="help-circle-outline"
          size={iconSize.sm}
          color={theme.colors.info}
          style={styles.helpIcon}
        />
        <Text variant="caption" color="secondary" style={styles.helpText}>
          {t("features.host.setup.policies.cancellationPolicyHelp")}
        </Text>
      </Container>
    </Container>
  );
};

const styles = StyleSheet.create({
  policyCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  policyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  refundDetails: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  refundIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  refundText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  helpIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default PolicyTypeSelector;
