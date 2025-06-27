/**
 * LoadingSkeleton component for the Hoy application
 * Creates placeholder loading skeletons with sheen animation effect
 */

// React
import React, { useEffect, useMemo } from "react";

// React Native
import { Animated, ViewStyle } from "react-native";

// Base components
import { Container } from "@shared/components/base";

// Context
import { useTheme } from "@shared/hooks/useTheme";

// Constants
import { radius } from "@shared/constants";

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
  const translateX = useMemo(() => new Animated.Value(-300), []);

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

  return (
    <Container
      style={[
        {
          backgroundColor: theme.colors.skeletonBackground,
          borderRadius: borderRadius,
          overflow: "hidden",
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      width={width as number}
      height={height as number}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: -(width as number),
            height: "100%",
            width: width as number,
            backgroundColor: theme.colors.skeletonHighlight,
            transform: [{ translateX }],
          },
        ]}
      />
    </Container>
  );
};

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
    <Container
      flexDirection="row"
      alignItems="center"
      padding="sm"
      height={height}
    >
      {hasImage && <ProfilePictureSkeleton size={imageSize} />}
      <Container flex={1} marginLeft="sm">
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <TextRowSkeleton
              key={i}
              width={i === 0 ? "70%" : "40%"}
              style={{ marginVertical: 5 }}
            />
          ))}
      </Container>
    </Container>
  );
};
