/**
 * FadeTransition Component
 * Handles smooth crossfade between skeleton and content with exact positioning
 * Uses Reanimated 3 for performant 60fps animations
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { Container } from '@shared/components/layout';

interface FadeTransitionProps {
  /** Animated opacity value for skeleton (0-1) */
  skeletonOpacity: SharedValue<number>;
  /** Animated opacity value for content (0-1) */
  contentOpacity: SharedValue<number>;
  /** Skeleton component to show during loading */
  skeleton: React.ReactNode;
  /** Content component to show when loaded */
  content: React.ReactNode;
  /** Whether to render content (for performance optimization) */
  shouldRenderContent: boolean;
  /** Additional styles for the container */
  style?: any;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * FadeTransition component that smoothly crossfades between skeleton and content
 * Maintains exact positioning during transition for seamless UX
 */
export const FadeTransition: React.FC<FadeTransitionProps> = ({
  skeletonOpacity,
  contentOpacity,
  skeleton,
  content,
  shouldRenderContent,
  style,
  testID,
}) => {
  // Animated style for skeleton
  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skeletonOpacity.value,
  }), [skeletonOpacity]);

  // Animated style for content
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }), [contentOpacity]);

  return (
    <Container style={[styles.container, style]} testID={testID}>
      {/* Skeleton Layer - Always render, control with opacity */}
      <Animated.View style={skeletonAnimatedStyle}>
        {skeleton}
      </Animated.View>
      
      {/* Content Layer - Only render when needed, positioned over skeleton */}
      {shouldRenderContent && (
        <Animated.View style={[styles.contentLayer, contentAnimatedStyle]}>
          {content}
        </Animated.View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FadeTransition;