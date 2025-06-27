import React from "react";
import { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export type AnimationType =
  | "fadeScale"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "fade"
  | "scale"
  | "bounce";

interface AnimatedContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  fadeInDelay?: number; // Delay before fade in animation starts (for staggered animations)
  animationDuration?: number; // Duration of animations
  isExiting?: boolean; // Triggers exit animation
  animationType?: AnimationType; // Type of animation to use
  slideDistance?: number; // Distance for slide animations
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  style,
  fadeInDelay = 0,
  animationDuration = 150,
  isExiting = false,
  animationType = "fadeScale",
  slideDistance = 50,
}) => {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(animationType.includes("scale") ? 0.8 : 1);
  const translateX = useSharedValue(
    animationType === "slideLeft"
      ? -slideDistance
      : animationType === "slideRight"
      ? slideDistance
      : 0
  );
  const translateY = useSharedValue(
    animationType === "slideUp"
      ? slideDistance
      : animationType === "slideDown"
      ? -slideDistance
      : 0
  );

  // Get easing function based on animation type
  const getEnterEasing = React.useCallback(() => {
    switch (animationType) {
      case "bounce":
        return Easing.out(Easing.back(1.5));
      case "slideUp":
        return Easing.out(Easing.cubic);
      case "slideDown":
        return Easing.out(Easing.cubic);
      case "slideLeft":
      case "slideRight":
        return Easing.out(Easing.quad);
      default:
        return Easing.out(Easing.back(1.2));
    }
  }, [animationType]);

  const getExitEasing = React.useCallback(() => {
    switch (animationType) {
      case "slideUp":
        return Easing.in(Easing.cubic);
      case "slideDown":
        return Easing.in(Easing.cubic);
      default:
        return Easing.in(Easing.cubic);
    }
  }, [animationType]);

  // Enter animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const enterEasing = getEnterEasing();

      opacity.value = withTiming(1, {
        duration: animationDuration,
        easing: enterEasing,
      });

      if (animationType.includes("scale") || animationType === "bounce") {
        scale.value = withTiming(1, {
          duration: animationDuration,
          easing: enterEasing,
        });
      }

      if (animationType.includes("slide")) {
        translateX.value = withTiming(0, {
          duration: animationDuration,
          easing: enterEasing,
        });
        translateY.value = withTiming(0, {
          duration: animationDuration,
          easing: enterEasing,
        });
      }
    }, fadeInDelay);

    return () => clearTimeout(timer);
  }, [
    fadeInDelay,
    animationDuration,
    animationType,
    opacity,
    scale,
    translateX,
    translateY,
    slideDistance,
    getEnterEasing,
  ]);

  // Exit animation when isExiting becomes true
  React.useEffect(() => {
    if (isExiting) {
      const exitEasing = getExitEasing();

      opacity.value = withTiming(0, {
        duration: animationDuration,
        easing: exitEasing,
      });

      if (animationType.includes("scale") || animationType === "bounce") {
        scale.value = withTiming(0.8, {
          duration: animationDuration,
          easing: exitEasing,
        });
      }

      if (animationType.includes("slide")) {
        const exitDistance = slideDistance * 0.5; // Smaller exit distance
        translateX.value = withTiming(
          animationType === "slideLeft"
            ? -exitDistance
            : animationType === "slideRight"
            ? exitDistance
            : 0,
          {
            duration: animationDuration,
            easing: exitEasing,
          }
        );
        translateY.value = withTiming(
          animationType === "slideUp"
            ? exitDistance
            : animationType === "slideDown"
            ? -exitDistance
            : 0,
          {
            duration: animationDuration,
            easing: exitEasing,
          }
        );
      }
    }
  }, [
    isExiting,
    animationDuration,
    animationType,
    opacity,
    scale,
    translateX,
    translateY,
    slideDistance,
    getExitEasing,
  ]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const transform = [];

    if (animationType.includes("scale") || animationType === "bounce") {
      transform.push({ scale: scale.value });
    }

    if (animationType.includes("slide")) {
      transform.push({ translateX: translateX.value });
      transform.push({ translateY: translateY.value });
    }

    return {
      opacity: opacity.value,
      transform,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};
