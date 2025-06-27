/**
 * AuthHeader component
 * Displays the authentication modal header based on the current view
 */

import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { fontSize } from "@shared/constants";

interface AuthHeaderProps {
  authView: "login" | "register";
}

export default function AuthHeader({ authView }: AuthHeaderProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <Text
      style={[
        styles.headerText,
        {
          color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
        },
      ]}
    >
      {authView === "login" ? t("auth.login") : t("auth.register")}
    </Text>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    textAlign: "center",
  },
});
