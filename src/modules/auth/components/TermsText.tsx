/**
 * TermsText component
 * Terms and privacy policy text
 */

import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";
import { fontSize, spacing } from "@shared/constants";

export default function TermsText() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <Text
      style={[
        styles.termsText,
        {
          color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
        },
      ]}
    >
      {t("auth.termsAgreement")}
      <Text style={{ color: theme.colors.primary }}>
        {t("auth.termsOfService")}
      </Text>
      {t("auth.and")}
      <Text style={{ color: theme.colors.primary }}>
        {t("auth.privacyPolicy")}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  termsText: {
    fontSize: fontSize.xs,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
