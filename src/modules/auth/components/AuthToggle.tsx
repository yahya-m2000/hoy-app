/**
 * AuthToggle component
 * Toggle between login and register views
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";
import { fontSize, spacing } from "@shared/constants";

interface AuthToggleProps {
  authView: "login" | "register";
  onToggle: () => void;
}

export default function AuthToggle({ authView, onToggle }: AuthToggleProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.toggleContainer}>
      <Text
        style={[
          styles.toggleText,
          {
            color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
          },
        ]}
      >
        {authView === "login"
          ? t("auth.noAccount")
          : t("auth.alreadyHaveAccount")}
      </Text>
      <TouchableOpacity onPress={onToggle}>
        <Text
          style={[styles.toggleActionText, { color: theme.colors.primary }]}
        >
          {authView === "login" ? t("auth.register") : t("auth.login")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  toggleText: {
    fontSize: fontSize.sm,
  },
  toggleActionText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
});
