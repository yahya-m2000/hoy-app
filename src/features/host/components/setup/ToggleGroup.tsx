/**
 * ToggleGroup Component
 *
 * Group of toggle switches for configuring house rules and other boolean settings.
 * Provides a clean, organized interface for multiple toggle options.
 *
 * @module @features/host/components/setup
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React from "react";
import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Icon } from "@shared/components";
import { spacing, radius, iconSize } from "@core/design";

interface ToggleOption {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  value: boolean;
  disabled?: boolean;
  recommended?: boolean;
}

interface ToggleGroupProps {
  title: string;
  subtitle?: string;
  options: ToggleOption[];
  onToggle: (id: string, value: boolean) => void;
  disabled?: boolean;
  showIcons?: boolean;
  showRecommended?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  title,
  subtitle,
  options,
  onToggle,
  disabled = false,
  showIcons = true,
  showRecommended = true,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handleToggle = (id: string, value: boolean) => {
    if (!disabled) {
      onToggle(id, value);
    }
  };

  const renderToggleOption = (option: ToggleOption) => {
    const isDisabled = disabled || option.disabled;
    const isRecommended = option.recommended && showRecommended;

    return (
      <TouchableOpacity
        key={option.id}
        onPress={() => handleToggle(option.id, !option.value)}
        disabled={isDisabled}
        style={[
          styles.toggleOption,
          variant === "compact" && styles.compactOption,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.white,
            borderColor: theme.colors.gray[200],
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Left Content */}
        <Container flex={1} flexDirection="row" alignItems="center">
          {/* Icon */}
          {showIcons && option.icon && (
            <Container
              style={[
                styles.iconContainer,
                ...(variant === "compact" ? [styles.compactIconContainer] : []),
                {
                  backgroundColor: option.value
                    ? theme.colors.primary + "20"
                    : theme.colors.gray[100],
                },
              ]}
            >
              <Icon
                name={option.icon as any}
                size={variant === "compact" ? iconSize.sm : iconSize.md}
                color={
                  option.value ? theme.colors.primary : theme.colors.gray[500]
                }
              />
            </Container>
          )}

          {/* Text Content */}
          <Container
            flex={1}
            paddingLeft={showIcons && option.icon ? "md" : "none"}
          >
            <Container flexDirection="row" alignItems="center">
              <Text
                variant={variant === "compact" ? "body" : "h6"}
                color="primary"
                style={[
                  styles.optionTitle,
                  variant === "compact" && styles.compactTitle,
                ]}
              >
                {option.title}
              </Text>

              {/* Recommended Badge */}
              {isRecommended && (
                <Container
                  style={[
                    styles.recommendedBadge,
                    {
                      backgroundColor: theme.colors.success,
                    },
                  ]}
                  marginLeft="sm"
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.recommendedText,
                      { color: theme.colors.white },
                    ]}
                  >
                    {t("host.setup.recommended")}
                  </Text>
                </Container>
              )}
            </Container>

            {/* Description */}
            {option.description && variant !== "compact" && (
              <Text
                variant="caption"
                color="secondary"
                style={styles.optionDescription}
              >
                {option.description}
              </Text>
            )}
          </Container>
        </Container>

        {/* Toggle Switch */}
        <Container>
          <Switch
            value={option.value}
            onValueChange={(value) => handleToggle(option.id, value)}
            disabled={isDisabled}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary + "40",
            }}
            thumbColor={
              option.value ? theme.colors.primary : theme.colors.white
            }
            ios_backgroundColor={theme.colors.gray[300]}
          />
        </Container>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      {/* Header */}
      <Container marginBottom="lg">
        <Text variant="h5" color="primary" style={styles.groupTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="body" color="secondary" style={styles.groupSubtitle}>
            {subtitle}
          </Text>
        )}
      </Container>

      {/* Toggle Options */}
      <Container
        style={{ gap: variant === "compact" ? spacing.sm : spacing.md }}
      >
        {options.map(renderToggleOption)}
      </Container>

      {/* Help Text for Detailed Variant */}
      {variant === "detailed" && (
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
            name="information-circle-outline"
            size={iconSize.sm}
            color={theme.colors.info}
            style={styles.helpIcon}
          />
          <Text variant="caption" color="secondary" style={styles.helpText}>
            {t("host.setup.toggleGroupHelp")}
          </Text>
        </Container>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactOption: {
    padding: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  compactIconContainer: {
    width: 32,
    height: 32,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  recommendedBadge: {
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  groupSubtitle: {
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

export default ToggleGroup;
