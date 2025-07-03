/**
 * Button component for the Hoy application
 * Supports primary, secondary, outline and ghost variants with accessibility features
 */

// React imports
import React from "react";

// React Native imports
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Text } from "../Text";
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { radius, fontSize, spacing } from "@core/design";
import { primary, secondary, gray } from "@core/design/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";
type ButtonRadius = "xs" | "sm" | "md" | "lg" | "xl" | "circle" | number;

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
  radius?: ButtonRadius;
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
  radius: buttonRadius = "circle",
}) => {
  // Determine border radius based on radius prop
  const getBorderRadius = () => {
    if (typeof buttonRadius === "number") {
      return buttonRadius;
    }

    switch (buttonRadius) {
      case "xs":
        return radius.xs;
      case "sm":
        return radius.sm;
      case "md":
        return radius.md;
      case "lg":
        return radius.lg;
      case "xl":
        return radius.xl;
      case "circle":
        return radius.circle;
      default:
        return radius.md;
    }
  };

  const { theme } = useTheme();

  // Determine button background color based on variant and state
  const getBackgroundColor = () => {
    if (disabled) return gray[100];

    switch (variant) {
      case "primary":
        return theme.text.primary; // #F56320 - Primary brand color
      case "secondary":
        return secondary[500];
      case "outline":
        return "transparent";
      case "ghost":
        return "transparent";
      default:
        return primary[500];
    }
  };

  // Determine button border color based on variant and state
  const getBorderColor = () => {
    if (disabled) return gray[300];

    switch (variant) {
      case "outline":
        return primary[500];
      case "primary":
        return primary[500];
      case "secondary":
        return secondary[500];
      default:
        return "transparent";
    }
  };

  // Determine text color based on variant and state
  const getTextColor = () => {
    if (disabled) return gray[400];

    switch (variant) {
      case "primary":
        return "#FFFFFF"; // White text on primary background
      case "secondary":
        return "#FFFFFF";
      case "outline":
        return theme.text.primary; // Use theme text color instead of primary color
      case "ghost":
        return gray[700];
      default:
        return "#FFFFFF";
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md };
      case "large":
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }; // Default matches PropertyTab
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
          borderRadius: getBorderRadius(),
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
                },
                textStyle,
              ]}
              weight="semibold"
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
