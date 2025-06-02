import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";

interface EmptyStateProps {
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isError = false,
  errorMessage,
  onRetry,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const iconName = isError ? "alert-circle-outline" : "search-outline";
  const iconColor = isError
    ? isDark
      ? theme.colors.errorPalette?.[400]
      : theme.colors.errorPalette?.[500]
    : isDark
    ? theme.colors.gray[400]
    : theme.colors.gray[500];

  const primaryText = isError
    ? errorMessage || t("search.errorLoading") || "Error loading properties"
    : t("search.noResults") || "No properties found";

  const secondaryText = isError
    ? t("search.errorTryAgain") || "Please try again"
    : t("search.tryDifferentFilters") || "Try adjusting your search criteria";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <Ionicons
        name={iconName}
        size={48}
        color={iconColor}
        style={styles.icon}
      />
      <Text
        style={[
          styles.primaryText,
          {
            color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
          },
        ]}
      >
        {primaryText}
      </Text>
      <Text
        style={[
          styles.secondaryText,
          {
            color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
          },
        ]}
      >
        {secondaryText}
      </Text>

      {isError && onRetry && (
        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>
            {t("search.retry") || "Try Again"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    marginBottom: spacing.md,
  },
  primaryText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  secondaryText: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
