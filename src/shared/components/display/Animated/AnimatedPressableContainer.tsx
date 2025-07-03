import React, { useCallback } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

interface AnimatedPressableContainerProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  fadeInDelay?: number; // Delay before fade in animation starts (for staggered animations)
  animationDuration?: number; // Duration of animations
  isExiting?: boolean; // Triggers exit animation
}

export const AnimatedPressableContainer: React.FC<
  AnimatedPressableContainerProps
> = ({
  children,
  onPress,
  style,
  disabled = false,
  fadeInDelay = 0,
  animationDuration = 150, // Faster default duration
  isExiting = false,
}) => {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8); // Fade in animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: animationDuration });
      scale.value = withTiming(1, { duration: animationDuration });
    }, fadeInDelay);

    return () => clearTimeout(timer);
  }, [fadeInDelay, animationDuration, opacity, scale]);

  // Exit animation when isExiting becomes true
  React.useEffect(() => {
    if (isExiting) {
      opacity.value = withTiming(0, { duration: animationDuration });
      scale.value = withTiming(0.8, { duration: animationDuration });
    }
  }, [isExiting, animationDuration, opacity, scale]);

  // Press animation - faster and smoother
  const handlePressIn = useCallback(() => {
    if (disabled) return;

    opacity.value = withTiming(0.8, { duration: animationDuration / 3 });
    scale.value = withTiming(0.96, { duration: animationDuration / 3 });
  }, [disabled, animationDuration, opacity, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    opacity.value = withTiming(1, { duration: animationDuration / 2 });
    scale.value = withTiming(1, { duration: animationDuration / 2 });
  }, [disabled, animationDuration, opacity, scale]);

  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;

    // Faster sequence: scale down -> scale up -> callback
    scale.value = withSequence(
      withTiming(0.94, { duration: animationDuration / 6 }),
      withTiming(1, { duration: animationDuration / 6 }, () => {
        runOnJS(onPress)();
      })
    );
  }, [disabled, onPress, animationDuration, scale]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={1} // We handle opacity manually
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};
