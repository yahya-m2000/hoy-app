import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

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
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.spinner}
      />
      <Text
        style={[
          styles.text,
          {
            color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
          },
        ]}
      >
        {message || t("search.loading") || "Loading properties..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
