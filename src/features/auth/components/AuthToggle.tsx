/**
 * AuthToggle component
 * Toggle between login and register views
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@shared/components";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { fontSize, spacing } from "@core/design";

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
          ? t("features.auth.forms.noAccount")
          : t("features.auth.forms.alreadyHaveAccount")}
      </Text>
      <TouchableOpacity onPress={onToggle}>
        <Text
          style={[styles.toggleActionText, { color: theme.colors.primary }]}
        >
          {authView === "login" ? t("features.auth.forms.signUp") : t("features.auth.forms.signIn")}
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
