/**
 * Success Header Component
 * Displays the booking confirmation success animation and message
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
// Context
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

const SuccessHeader: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.successCircle,
          { backgroundColor: theme.colors.success[500] },
        ]}
      >
        <Ionicons name="checkmark" size={48} color={theme.colors.primary} />
      </View>
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.white : theme.colors.grayPalette[900] },
        ]}
      >
        {t("booking.bookingConfirmed")}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
          },
        ]}
      >
        {t("booking.confirmationMessage")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: fontSize.md,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
    lineHeight: fontSize.md * 1.4,
  },
});

export default SuccessHeader;
