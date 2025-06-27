import React from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components/base";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";

interface SearchEmptyStateProps {
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
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
    <Container
      justifyContent="center"
      alignItems="center"
      paddingVertical="xxl"
      paddingHorizontal="lg"
      backgroundColor={isDark ? theme.colors.gray[900] : theme.colors.gray[50]}
    >
      <Container marginBottom="md">
        <Ionicons name={iconName} size={48} color={iconColor} />
      </Container>
      <Container alignItems="center" marginBottom="xs">
        <Text
          size="lg"
          weight="semibold"
          color={isDark ? theme.colors.gray[200] : theme.colors.gray[800]}
        >
          {primaryText}
        </Text>
      </Container>
      <Container alignItems="center" marginBottom="lg">
        <Text
          size="md"
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
        >
          {secondaryText}
        </Text>
      </Container>

      {isError && onRetry && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
          onPress={onRetry}
        >
          <Text size="md" weight="medium" color="white">
            {t("search.retry") || "Try Again"}
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
};
