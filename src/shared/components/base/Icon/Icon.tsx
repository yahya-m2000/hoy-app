import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { IconProps } from "./Icon.types";
import {
  fontSize,
  iconSize,
  theme as palette,
  primary,
  secondary,
  tertiary,
  success,
  error,
  warning,
  info,
} from "@core/design";
import { useTheme } from "@core/hooks";

// Extend IconProps to include colorScheme
interface ExtendedIconProps extends Omit<IconProps, "color" | "size"> {
  color?:
    | string // direct color value
    | "primary"
    | "secondary"
    | "tertiary"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "inverse"
    | "default";
  size?: number | keyof typeof iconSize;
}

/**
 * Icon component with optional circular background
 * Supports all Ionicons with customizable size, color, and background
 * Now supports colorScheme prop for theme-based coloring
 */
const Icon: React.FC<ExtendedIconProps> = ({
  name,
  size = "md",
  color,
  style,
  background = false,
  backgroundColor = "rgba(0, 0, 0, 0.1)",
  backgroundOpacity = 0.1,
}) => {
  const { theme } = useTheme();

  // Resolve size from keyword or use as number
  const resolvedSize =
    typeof size === "string" ? iconSize[size] || iconSize.md : size;

  // Map color keyword to theme color, or use as direct color value
  const getIconColor = () => {
    switch (color) {
      case "primary":
        return theme.colors?.primary || palette.light.primary;
      case "secondary":
        return theme.colors?.secondary || palette.light.secondary;
      case "tertiary":
        return theme.colors?.tertiary || palette.light.tertiary;
      case "success":
        return theme.colors?.success || palette.light.success;
      case "error":
        return theme.colors?.error || palette.light.error;
      case "warning":
        return theme.colors?.warning || palette.light.warning;
      case "info":
        return theme.colors?.info || palette.light.info;
      case "inverse":
        return theme.text?.inverse || palette.light.text.inverse;
      case "default":
        return theme.text?.primary || palette.light.text.primary;
      default:
        // If color is a string and not a keyword, use it directly
        if (
          typeof color === "string" &&
          color &&
          !color.match(
            /^(primary|secondary|tertiary|success|error|warning|info|inverse|default)$/
          )
        ) {
          return color;
        }
        return theme.text?.primary || palette.light.text.primary;
    }
  };

  const iconColor = getIconColor();

  // Helper function to get background color with opacity
  const getBackgroundColor = (): string => {
    if (backgroundColor.includes("rgba")) {
      return backgroundColor;
    }

    const opacity = Math.round(backgroundOpacity * 255)
      .toString(16)
      .padStart(2, "0");
    return `${backgroundColor}${opacity}`;
  };

  // Render icon with circular background
  if (background) {
    const iconSize = resolvedSize;
    const backgroundSize = iconSize + 16; // Add padding for visual balance

    return (
      <View
        style={[
          styles.backgroundContainer,
          {
            width: backgroundSize,
            height: backgroundSize,
            borderRadius: backgroundSize / 2,
            backgroundColor: getBackgroundColor(),
          },
          style,
        ]}
      >
        <Ionicons name={name} size={iconSize} color={iconColor} />
      </View>
    );
  }

  // Render plain icon
  return (
    <Ionicons name={name} size={resolvedSize} color={iconColor} style={style} />
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export { Icon };
export default Icon;
