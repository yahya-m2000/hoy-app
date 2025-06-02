/**
 * Bottom Buttons Component
 * Displays the main action buttons (View Details and Done)
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useUserRole } from "@common/context/UserRoleContext";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface BottomButtonsProps {
  bookingId: string;
}

const BottomButtons: React.FC<BottomButtonsProps> = ({ bookingId }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isHost } = useUserRole();

  // Navigate to booking details
  const handleViewBooking = () => {
    if (!bookingId) return;
    router.push(`/bookings/${bookingId}`);
  };

  // Go to home screen based on user role
  const handleDone = () => {
    const homeRoute = isHost ? "/(tabs)/host/home" : "/(tabs)/traveler/home";
    router.replace(homeRoute);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.viewButton, { borderColor: theme.colors.primary }]}
        onPress={handleViewBooking}
      >
        <Text style={[styles.viewButtonText, { color: theme.colors.primary }]}>
          {t("booking.viewBookingDetails")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>{t("common.done")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  viewButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  doneButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  doneButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: "white",
  },
});

export default BottomButtons;
