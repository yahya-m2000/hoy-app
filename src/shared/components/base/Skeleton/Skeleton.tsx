import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["#E1E9EE", "#F5F5F5"],
      })
    : "#E1E9EE";

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
});

export default Skeleton;
