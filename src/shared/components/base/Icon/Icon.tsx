import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { IconProps } from "./Icon.types";
import { fontSize } from "src/shared/constants";

/**
 * Icon component with optional circular background
 * Supports all Ionicons with customizable size, color, and background
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = fontSize.md,
  color = "#000",
  style,
  background = false,
  backgroundColor = "rgba(0, 0, 0, 0.1)",
  backgroundOpacity = 0.1,
}) => {
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
    const iconSize = size || fontSize.md;
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
        <Ionicons name={name} size={iconSize} color={color} />
      </View>
    );
  }

  // Render plain icon
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

const styles = StyleSheet.create({
  backgroundContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export { Icon };
export default Icon;
