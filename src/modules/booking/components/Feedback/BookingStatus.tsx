/**
 * BookingStatus Component
 * Reusable component for displaying booking status badges with consistent styling
 * Uses theme colors and supports different sizes
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@shared/hooks/useTheme";
import { useUserRole } from "@shared/context";
import { radius, fontSize, fontWeight, spacing } from "@shared/constants";

export type BookingStatusType =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

interface BookingStatusProps {
  status: BookingStatusType;
  size?: "small" | "medium" | "large";
  style?: any;
}

const BookingStatus: React.FC<BookingStatusProps> = ({
  status,
  size = "medium",
  style,
}) => {
  const { theme, isDark } = useTheme();

  const getStatusColors = (status: BookingStatusType) => {
    switch (status.toLowerCase() as BookingStatusType) {
      case "confirmed":
        return {
          textColor: theme.colors.successPalette[600] || "#059669",
          backgroundColor: theme.colors.successPalette[100] || "#dcfce7",
          darkBackgroundColor: theme.colors.successPalette[900] || "#064e3b",
        };
      case "pending":
        return {
          textColor: theme.colors.warningPalette[600] || "#d97706",
          backgroundColor: theme.colors.warningPalette[100] || "#fef3c7",
          darkBackgroundColor: theme.colors.warningPalette[800] || "#92400e",
        };
      case "completed":
        return {
          textColor: theme.colors.infoPalette[600] || "#2563eb",
          backgroundColor: theme.colors.infoPalette[100] || "#dbeafe",
          darkBackgroundColor: theme.colors.infoPalette[900] || "#1e3a8a",
        };
      case "cancelled":
        return {
          textColor: theme.colors.errorPalette[600] || "#dc2626",
          backgroundColor: theme.colors.errorPalette[100] || "#fee2e2",
          darkBackgroundColor: theme.colors.errorPalette[900] || "#7f1d1d",
        };
      default:
        return {
          textColor: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          darkBackgroundColor: theme.colors.gray[800],
        };
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
          fontSize: fontSize.xs,
        };
      case "large":
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          fontSize: fontSize.sm,
        };
      default: // medium
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          fontSize: fontSize.xs,
        };
    }
  };

  const statusColors = getStatusColors(status);
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: isDark
            ? statusColors.darkBackgroundColor
            : statusColors.backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          {
            color: statusColors.textColor,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default BookingStatus;
