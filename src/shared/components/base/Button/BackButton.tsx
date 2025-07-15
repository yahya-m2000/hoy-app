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
import { useTheme } from "src/core/hooks/useTheme";
import { Icon } from "@shared/components";

// Constants
import { spacing, fontSize } from "@core/design";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: any;
}

export default function BackButton({
  onPress,
  color,
  size = fontSize.lg,
  style,
}: BackButtonProps) {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconColor = color || (isDark ? theme.white : theme.black);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Icon name="chevron-back-outline" size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
});
