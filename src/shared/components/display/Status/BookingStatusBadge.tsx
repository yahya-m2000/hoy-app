/**
 * BookingStatusBadge Component
 * Reusable status badge for booking status display
 */

import React from "react";
import { View } from "react-native";
import { Text } from "../../base/Text";
import { useTheme } from "@core/hooks/useTheme";
import type { BookingStatus, PaymentStatus } from "@core/types";

interface BookingStatusBadgeProps {
  status: BookingStatus | PaymentStatus;
  type: "booking" | "payment";
  size?: "small" | "medium" | "large";
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  type,
  size = "medium",
}) => {
  const { theme } = useTheme();

  // Get status colors
  const getStatusColor = (
    status: BookingStatus | PaymentStatus,
    type: "booking" | "payment"
  ) => {
    if (type === "booking") {
      switch (status) {
        case "confirmed":
        case "completed":
          return theme.colors.primary;
        case "pending":
        case "in_progress":
          return "#FFA500"; // Orange
        case "cancelled":
          return theme.colors.gray[500];
        default:
          return theme.colors.gray[400];
      }
    } else {
      switch (status) {
        case "paid":
          return theme.colors.primary;
        case "pending":
          return "#FFA500"; // Orange
        case "failed":
        case "refunded":
        case "partial":
          return theme.colors.gray[500];
        default:
          return theme.colors.gray[400];
      }
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        };
      case "large":
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
        };
      default: // medium
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
        };
    }
  };

  const getTextVariant = () => {
    switch (size) {
      case "small":
        return "caption" as const;
      case "large":
        return "body" as const;
      default:
        return "caption" as const;
    }
  };

  const statusColor = getStatusColor(status, type);
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        sizeStyles,
        {
          backgroundColor: statusColor + "20",
        },
      ]}
    >
      <Text
        variant={getTextVariant()}
        weight="medium"
        color={statusColor}
        style={{ textTransform: "capitalize" }}
      >
        {/* {status.replace("-", " ")} */}
      </Text>
    </View>
  );
};
