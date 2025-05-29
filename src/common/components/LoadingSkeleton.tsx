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
  style?: ViewStyle | ViewStyle[];
  circle?: boolean; // Add circle prop for circular skeletons
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = radius.sm,
  style,
  circle = false,
}) => {
  const { theme } = useTheme();
  const translateX = new Animated.Value(-300);

  useEffect(() => {
    // Start the sheen animation
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  const skeletonStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius: circle
      ? typeof height === "number"
        ? height / 2
        : 25
      : borderRadius,
    backgroundColor: theme.colors.skeletonBackground,
  };

  const combinedStyle = Array.isArray(style)
    ? [styles.skeleton, skeletonStyle, ...style]
    : [styles.skeleton, skeletonStyle, style];

  return (
    <View style={combinedStyle}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: theme.colors.skeletonHighlight,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  shimmer: {
    width: "30%",
    height: "100%",
    opacity: 0.3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 10,
  },
});

export default LoadingSkeleton;

/**
 * LoadingPlaceholder component - Helper components for specific UI elements
 */

export const ProfilePictureSkeleton: React.FC<{ size?: number }> = ({
  size = 50,
}) => {
  return (
    <LoadingSkeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={{ margin: 5 }}
    />
  );
};

export const TextRowSkeleton: React.FC<{
  width?: string | number;
  height?: number;
  style?: ViewStyle;
}> = ({ width = "80%", height = 15, style }) => {
  return <LoadingSkeleton width={width} height={height} style={style} />;
};

export const CardSkeleton: React.FC<{
  height?: number;
  style?: ViewStyle | ViewStyle[];
}> = ({ height = 100, style }) => {
  const baseStyle: ViewStyle = { marginVertical: 10 };

  let combinedStyle: ViewStyle | ViewStyle[];
  if (Array.isArray(style)) {
    combinedStyle = [baseStyle, ...style];
  } else if (style) {
    combinedStyle = [baseStyle, style];
  } else {
    combinedStyle = baseStyle;
  }

  return <LoadingSkeleton height={height} style={combinedStyle} />;
};

export const ListItemSkeleton: React.FC<{
  lines?: number;
  hasImage?: boolean;
  imageSize?: number;
  height?: number;
}> = ({ lines = 2, hasImage = true, imageSize = 50, height = 70 }) => {
  return (
    <View style={styles.listItem}>
      {hasImage && <ProfilePictureSkeleton size={imageSize} />}
      <View style={styles.listItemContent}>
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <TextRowSkeleton
              key={i}
              width={i === 0 ? "70%" : "40%"}
              style={{ marginVertical: 5 }}
            />
          ))}
      </View>
    </View>
  );
};
