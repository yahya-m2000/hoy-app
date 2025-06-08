/**
 * Text component for the Hoy application
 * Provides consistent text styles with variant and size support
 */

// React
import React from "react";

// React Native
import { Text as RNText, StyleSheet } from "react-native";

// Context
import { useTheme } from "@shared/context";

// Types
import { BaseTextProps } from "./Text.types";

const Text: React.FC<BaseTextProps> = ({
  children,
  variant = "body",
  size = "md",
  weight = "normal",
  color,
  align = "left",
  style,
  numberOfLines,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "h1":
        return { fontSize: 32, lineHeight: 40 };
      case "h2":
        return { fontSize: 24, lineHeight: 32 };
      case "h3":
        return { fontSize: 20, lineHeight: 28 };
      case "h4":
        return { fontSize: 18, lineHeight: 24 };
      case "body":
        return { fontSize: 16, lineHeight: 24 };
      case "caption":
        return { fontSize: 14, lineHeight: 20 };
      case "label":
        return { fontSize: 12, lineHeight: 16 };
      default:
        return { fontSize: 16, lineHeight: 24 };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return { fontSize: 12, lineHeight: 16 };
      case "sm":
        return { fontSize: 14, lineHeight: 20 };
      case "md":
        return { fontSize: 16, lineHeight: 24 };
      case "lg":
        return { fontSize: 18, lineHeight: 28 };
      case "xl":
        return { fontSize: 20, lineHeight: 28 };
      case "2xl":
        return { fontSize: 24, lineHeight: 32 };
      default:
        return { fontSize: 16, lineHeight: 24 };
    }
  };

  const getWeightStyles = () => {
    switch (weight) {
      case "normal":
        return { fontWeight: "400" as const };
      case "medium":
        return { fontWeight: "500" as const };
      case "semibold":
        return { fontWeight: "600" as const };
      case "bold":
        return { fontWeight: "700" as const };
      default:
        return { fontWeight: "400" as const };
    }
  };

  // Use variant styles by default, but allow size to override
  const combinedStyles =
    variant === "body" ? getSizeStyles() : getVariantStyles();

  return (
    <RNText
      style={[
        styles.text,
        combinedStyles,
        getWeightStyles(),
        {
          color: color || theme.text.primary,
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Base styles
  },
});

export default Text;
