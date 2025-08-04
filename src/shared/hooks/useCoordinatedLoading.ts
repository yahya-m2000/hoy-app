/**
 * useCoordinatedLoading Hook
 * Coordinates multiple loading states to ensure all components load together
 * Provides smooth fade transitions between skeleton and content states
 */

import { useState, useEffect, useMemo } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

export interface CoordinatedLoadingConfig {
  /** Duration of fade transition in milliseconds */
  transitionDuration?: number;
  /** Delay before starting transition after all loaded */
  transitionDelay?: number;
  /** Minimum time to show loading state for graceful UX */
  minimumLoadingTime?: number;
  /** Easing function for smooth transitions */
  easing?: typeof Easing.bezier;
}

export interface CoordinatedLoadingReturn {
  /** True when all loading states are false */
  isAllLoaded: boolean;
  /** True when any loading state is true */
  isAnyLoading: boolean;
  /** Animated value for skeleton opacity (1 = visible, 0 = hidden) */
  skeletonOpacity: any;
  /** Animated value for content opacity (1 = visible, 0 = hidden) */
  contentOpacity: any;
  /** Animated value for tab bar opacity (0 = hidden during loading, 1 = visible) */
  tabBarOpacity: any;
  /** Whether content should be rendered (for performance) */
  shouldRenderContent: boolean;
  /** Reset function to restart loading cycle */
  reset: () => void;
}

const DEFAULT_CONFIG: Required<CoordinatedLoadingConfig> = {
  transitionDuration: 600,
  transitionDelay: 100,
  minimumLoadingTime: 800,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Hook for coordinating multiple loading states with smooth transitions
 * 
 * @param loadingStates Array of boolean loading states to coordinate
 * @param config Optional configuration for transition timing and easing
 * @returns Object with loading states and animated values for transitions
 * 
 * @example
 * ```typescript
 * const { isAllLoaded, skeletonOpacity, contentOpacity, shouldRenderContent } = useCoordinatedLoading([
 *   propertiesLoading,
 *   userLoading,
 *   citiesLoading
 * ]);
 * ```
 */
export const useCoordinatedLoading = (
  loadingStates: boolean[],
  config: CoordinatedLoadingConfig = {}
): CoordinatedLoadingReturn => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Animated values for fade transitions
  const skeletonOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const tabBarOpacity = useSharedValue(0); // Start hidden during loading
  
  // Local state for controlling render optimization
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  
  // Calculate loading states
  const isAnyLoading = useMemo(() => 
    loadingStates.some(state => state === true), 
    [loadingStates]
  );
  
  const isAllLoaded = useMemo(() => 
    loadingStates.length > 0 && loadingStates.every(state => state === false), 
    [loadingStates]
  );
  
  // Reset function to restart the loading cycle
  const reset = () => {
    skeletonOpacity.value = 1;
    contentOpacity.value = 0;
    tabBarOpacity.value = 0;
    setShouldRenderContent(false);
    setHasStartedTransition(false);
    setLoadingStartTime(Date.now());
  };
  
  // Handle transition when all components are loaded
  useEffect(() => {
    if (isAllLoaded && !hasStartedTransition && loadingStartTime !== null) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, mergedConfig.minimumLoadingTime - elapsedTime);
      
      setHasStartedTransition(true);
      
      // Start rendering content for measurement
      setShouldRenderContent(true);
      
      const startTransition = () => {
        // Fade out skeleton
        skeletonOpacity.value = withTiming(0, {
          duration: mergedConfig.transitionDuration,
          easing: mergedConfig.easing,
        });
        
        // Fade in content and tab bar simultaneously
        contentOpacity.value = withTiming(1, {
          duration: mergedConfig.transitionDuration,
          easing: mergedConfig.easing,
        });
        
        tabBarOpacity.value = withTiming(1, {
          duration: mergedConfig.transitionDuration,
          easing: mergedConfig.easing,
        });
      };
      
      // Wait for minimum loading time + transition delay
      const totalDelay = remainingTime + mergedConfig.transitionDelay;
      if (totalDelay > 0) {
        setTimeout(startTransition, totalDelay);
      } else {
        startTransition();
      }
    }
  }, [isAllLoaded, hasStartedTransition, loadingStartTime, mergedConfig, skeletonOpacity, contentOpacity]);
  
  // Initialize loading start time when loading begins or on mount
  useEffect(() => {
    if (loadingStartTime === null) {
      setLoadingStartTime(Date.now());
    }
  }, [loadingStartTime]);
  
  // Update loading start time when loading begins again
  useEffect(() => {
    if (isAnyLoading && loadingStartTime === null) {
      setLoadingStartTime(Date.now());
    }
  }, [isAnyLoading, loadingStartTime]);
  
  // Reset when loading starts again after being completed
  useEffect(() => {
    if (isAnyLoading && hasStartedTransition) {
      reset();
    }
  }, [isAnyLoading, hasStartedTransition]);
  
  return {
    isAllLoaded,
    isAnyLoading,
    skeletonOpacity,
    contentOpacity,
    tabBarOpacity,
    shouldRenderContent,
    reset,
  };
};

export default useCoordinatedLoading;