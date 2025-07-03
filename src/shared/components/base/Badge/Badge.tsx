/**
 * Badge component for the Hoy application
 * Used for notification counts, status indicators, and labels
 */

// React imports
import React from "react";

// React Native imports
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Text } from "../Text";

// Internal imports
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { radius, fontSize, fontWeight, spacing } from "@core/design";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  content?: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  content,
  variant = "primary",
  size = "md",
  dot = false,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.secondary;
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.info;
      case "gray":
        return isDark ? theme.colors.gray[700] : theme.colors.gray[300];
      default:
        return theme.colors.primary;
    }
  };

  // Get size dimensions
  const getSizeDimensions = () => {
    if (dot) {
      switch (size) {
        case "sm":
          return { width: 8, height: 8 };
        case "md":
          return { width: 10, height: 10 };
        case "lg":
          return { width: 12, height: 12 };
        default:
          return { width: 10, height: 10 };
      }
    } else {
      // For content badges, minimum dimensions with dynamic width
      switch (size) {
        case "sm":
          return {
            minWidth: 16,
            height: 16,
            paddingHorizontal: typeof content === "string" ? spacing.xxs : 0,
          };
        case "md":
          return {
            minWidth: 20,
            height: 20,
            paddingHorizontal:
              typeof content === "string" ? spacing.xs : spacing.xxs,
          };
        case "lg":
          return {
            minWidth: 24,
            height: 24,
            paddingHorizontal:
              typeof content === "string" ? spacing.sm : spacing.xs,
          };
        default:
          return {
            minWidth: 20,
            height: 20,
            paddingHorizontal:
              typeof content === "string" ? spacing.xs : spacing.xxs,
          };
      }
    }
  };

  // Get text size based on badge size
  const getTextSize = (): number => {
    switch (size) {
      case "sm":
        return fontSize.xxs;
      case "md":
        return fontSize.xs;
      case "lg":
        return fontSize.sm;
      default:
        return fontSize.xs;
    }
  };

  const sizeDimensions = getSizeDimensions();
  const badgeFontSize = getTextSize();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          ...sizeDimensions,
          borderRadius: dot ? radius.circle : radius.pill,
        },
        style,
      ]}
    >
      {!dot && content != null && (
        <Text
          style={[
            styles.text,
            {
              color: theme.colors.gray[50],
              fontSize: badgeFontSize,
            },
            textStyle,
          ]}
        >
          {content}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: "center",
  },
});

export default Badge;
