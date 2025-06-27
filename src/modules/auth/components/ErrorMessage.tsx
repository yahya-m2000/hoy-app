/**
 * ErrorMessage component
 * Displays error messages with consistent styling
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";
import { fontSize, spacing, radius } from "@shared/constants";

interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  const { theme, isDark } = useTheme();

  if (!error) return null;

  return (
    <View
      style={[
        styles.errorContainer,
        {
          backgroundColor: isDark
            ? theme.colors.errorPalette[900]
            : theme.colors.errorPalette[50],
          borderColor: theme.colors.error,
        },
      ]}
    >
      <Ionicons
        name="alert-circle-outline"
        size={20}
        color={theme.colors.error}
      />
      <Text
        style={[
          styles.errorText,
          {
            color: isDark ? theme.colors.error[100] : theme.colors.error[700],
          },
        ]}
      >
        {error}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
});
