/**
 * Base Card component
 * Provides fundamental card structure and behavior
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  AccessibilityRole,
  Animated,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { BaseCardProps, CardDimensions } from "./types";

export const BaseCard: React.FC<BaseCardProps> = ({
  variant = "vertical",
  size = "medium",
  style,
  containerStyle,
  onPress,
  onLongPress,
  disabled = false,
  isLoading = false,
  animateOnMount = false,
  fadeInDuration = 300,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  children,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;

  // Handle fade-in animation when not loading and animation is enabled
  useEffect(() => {
    if (animateOnMount && !isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeInDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, animateOnMount, fadeInDuration, fadeAnim]);

  // Handle fade-out when loading starts
  useEffect(() => {
    if (isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim]);

  // Get variant-specific dimensions and styles
  const getCardDimensions = (): CardDimensions => {
    switch (variant) {
      case "horizontal":
        return {
          height: size === "small" ? 120 : size === "medium" ? 140 : 160,
          imageHeight: size === "small" ? 120 : size === "medium" ? 140 : 160,
        };
      case "vertical":
        return {
          imageHeight: size === "small" ? 160 : size === "medium" ? 200 : 240,
        };
      case "collection":
        return {
          imageHeight: size === "small" ? 120 : size === "medium" ? 150 : 180,
        };
      default:
        return {};
    }
  };

  const getCardStyles = (): ViewStyle => {
    const dimensions = getCardDimensions();

    const baseStyles: ViewStyle = {
      overflow: "hidden",
    };

    // Variant-specific styles
    switch (variant) {
      case "horizontal":
        return {
          ...baseStyles,
          flexDirection: "row",
          height: dimensions.height,
        };
      case "vertical":
        return {
          ...baseStyles,
          flexDirection: "column",
        };
      case "collection":
        return {
          ...baseStyles,
          flexDirection: "column",
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();
  // Render as pressable if onPress is provided
  if (onPress || onLongPress) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Pressable
          style={({ pressed }) => [
            cardStyles,
            containerStyle,
            pressed && !disabled && styles.pressed,
            disabled && styles.disabled,
            style,
          ]}
          onPress={disabled ? undefined : onPress}
          onLongPress={disabled ? undefined : onLongPress}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          testID={testID}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  // Render as static view
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View
        style={[cardStyles, containerStyle, disabled && styles.disabled, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});

export default BaseCard;
