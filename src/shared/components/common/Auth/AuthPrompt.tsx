/**
 * AuthPrompt Component
 * Displays authentication prompt when user is not signed in
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// Context
import { useTheme } from "@shared/context";
import { Icon } from "@shared/components";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

const AuthPrompt: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.authPromptContainer}>
      <Icon
        name="calendar-outline"
        size={64}
        color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
      />

      <Text
        style={[
          styles.authPromptTitle,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        {t("booking.signInRequired")}
      </Text>

      <Text
        style={[
          styles.authPromptText,
          {
            color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
          },
        ]}
      >
        {t("booking.signInToViewBookings")}
      </Text>

      <TouchableOpacity
        style={[styles.signInButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/(overlays)/auth")}
      >
        <Text style={styles.signInButtonText}>{t("booking.signIn")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  authPromptTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  authPromptText: {
    fontSize: fontSize.md,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: spacing.lg,
  },
  signInButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  signInButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});

export default AuthPrompt;
