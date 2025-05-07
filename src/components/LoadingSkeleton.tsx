/**
 * LoadingSkeleton component for the Hoy application
 * Creates placeholder loading skeletons with sheen animation effect
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../constants/radius";

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = radius.md,
  style,
}) => {
  const { theme, isDark } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shimmerAnim = new Animated.Value(0);

  // Base color for skeleton based on theme
  const baseColor = isDark ? theme.colors.gray[700] : theme.colors.gray[200];
  const highlightColor = isDark
    ? theme.colors.gray[600]
    : theme.colors.gray[300];

  // Run shimmer animation
  useEffect(() => {
    const runAnimation = () => {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start(() => runAnimation());
    };

    runAnimation();

    return () => {
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim]);

  // Ensure width/height are valid DimensionValue (number or 'auto'/'100%')
  const resolvedWidth =
    typeof width === "number" ? width : width === "100%" ? "100%" : undefined;
  const resolvedHeight =
    typeof height === "number"
      ? height
      : height === "100%"
      ? "100%"
      : undefined;

  // Create gradient-like effect using interpolation
  const shimmerStyle: ViewStyle = {
    backgroundColor: baseColor,
    overflow: "hidden",
    position: "relative",
  };

  // Animated highlight that moves across the skeleton
  const shimmerHighlight = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: highlightColor,
    transform: [
      {
        translateX: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [
            typeof resolvedWidth === "number" ? -resolvedWidth : -100,
            typeof resolvedWidth === "number" ? resolvedWidth : 100,
          ],
        }),
      },
    ],
    opacity: 0.7,
  };

  return (
    <View
      style={[
        styles.skeleton,
        shimmerStyle,
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={shimmerHighlight} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingSkeleton;
