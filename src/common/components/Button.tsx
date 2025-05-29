/**
 * Button component for the Hoy application
 * Supports primary, secondary, outline and ghost variants with accessibility features
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { fontSize, fontWeight } from "../constants/typography";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { theme, isDark } = useTheme();

  // Determine button background color based on variant and state
  const getBackgroundColor = () => {
    if (disabled)
      return isDark ? theme.colors.grayPalette[700] : theme.colors.grayPalette[300];

    switch (variant) {
      case "primary":
        return theme.primary[500];
      case "secondary":
        return theme.secondary[500];
      case "outline":
        return "transparent";
      case "ghost":
        return "transparent";
      default:
        return theme.primary[500];
    }
  };

  // Determine button border color based on variant and state
  const getBorderColor = () => {
    if (disabled) return "transparent";

    switch (variant) {
      case "outline":
        return isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700];
      case "primary":
        return theme.primary[500];
      case "secondary":
        return theme.secondary[500];
      default:
        return "transparent";
    }
  };

  // Determine text color based on variant and state
  const getTextColor = () => {
    if (disabled)
      return isDark ? theme.colors.grayPalette[500] : theme.colors.grayPalette[500];

    switch (variant) {
      case "primary":
      case "secondary":
        return theme.white;
      case "outline":
      case "ghost":
        return isDark ? theme.colors.grayPalette[300] : theme.colors.gray[800];
      default:
        return theme.white;
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md };
      case "large":
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
    }
  };

  // Determine font size based on button size
  const getFontSize = () => {
    switch (size) {
      case "small":
        return fontSize.sm;
      case "large":
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={loading ? undefined : onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          ...getPadding(),
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            color={getTextColor()}
            size={size === "small" ? "small" : "small"}
          />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: getFontSize(),
                  fontWeight: String(fontWeight.normal) as any,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === "right" && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});

export default Button;

