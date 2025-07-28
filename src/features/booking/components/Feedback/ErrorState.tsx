/**
 * Error State Component
 * Displays error state when booking is not found
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
// Context
import { useTheme } from "@core/hooks";

// Constants
import { fontSize, spacing, radius } from "@core/design";

const ErrorState: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle-outline"
        size={64}
        color={theme.colors.error}
      />
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        {t("features.booking.errors.bookingNotFound")}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
          },
        ]}
      >
        {t("features.booking.errors.bookingNotFoundMessage")}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleGoHome}
      >
        <Text style={styles.buttonText}>{t("common.goHome")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: fontSize.md * 1.4,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: "white",
  },
});

export default ErrorState;
