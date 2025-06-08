/**
 * Reusable Back Button Component
 * Provides consistent navigation back functionality across screens
 */

// React
import React from "react";

// React Native
import { TouchableOpacity, StyleSheet } from "react-native";

// Expo
import { router } from "expo-router";

// Context
import { useTheme } from "@shared/context";

// Constants
import { spacing } from "@shared/constants";

// Base components
import { Icon } from "../../base/Icon";

// Types
import type { BackButtonProps } from "./Navigation.types";

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color,
  size = 24,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconColor = color || (isDark ? theme.colors.white : theme.colors.black);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Icon name="arrow-back" size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
});
