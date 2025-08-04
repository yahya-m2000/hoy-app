/**
 * CoordinatedLoadingWrapper Components
 * Easy-to-use wrapper components for implementing coordinated loading
 * Provides SkeletonWrapper and ContentWrapper for seamless integration
 */

import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Container } from '@shared/components/layout';
import { useCoordinatedLoading, CoordinatedLoadingConfig } from '@shared/hooks/useCoordinatedLoading';

interface BaseWrapperProps {
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

interface CoordinatedLoadingWrapperProps extends BaseWrapperProps {
  /** Array of loading states to coordinate */
  loadingStates: boolean[];
  /** Skeleton component to show during loading */
  skeleton: React.ReactNode;
  /** Configuration for transition timing and easing */
  config?: CoordinatedLoadingConfig;
}

/**
 * All-in-one wrapper that handles coordinated loading with fade transitions
 * 
 * @example
 * ```typescript
 * <CoordinatedLoadingWrapper
 *   loadingStates={[propertiesLoading, userLoading]}
 *   skeleton={<PropertyCardSkeleton />}
 * >
 *   <PropertyCard {...props} />
 * </CoordinatedLoadingWrapper>
 * ```
 */
export const CoordinatedLoadingWrapper: React.FC<CoordinatedLoadingWrapperProps> = ({
  loadingStates,
  skeleton,
  children,
  config,
  style,
  testID,
}) => {
  const {
    isAllLoaded,
    shouldRenderContent,
    skeletonOpacity,
    contentOpacity,
  } = useCoordinatedLoading(loadingStates, config);

  // Simple conditional rendering instead of complex absolute positioning
  if (!isAllLoaded) {
    return (
      <Container style={style} testID={testID}>
        {skeleton}
      </Container>
    );
  }

  return (
    <Container style={style} testID={testID}>
      {children}
    </Container>
  );
};

/**
 * Hook-based approach for more complex scenarios
 * Returns wrapper components that share the same loading coordination
 * 
 * @example
 * ```typescript
 * const { SkeletonWrapper, ContentWrapper } = useCoordinatedLoadingWrappers([
 *   propertiesLoading,
 *   userLoading
 * ]);
 * 
 * return (
 *   <>
 *     <SkeletonWrapper><PropertyCardSkeleton /></SkeletonWrapper>
 *     <ContentWrapper><PropertyCard /></ContentWrapper>
 *   </>
 * );
 * ```
 */
export const useCoordinatedLoadingWrappers = (
  loadingStates: boolean[],
  config?: CoordinatedLoadingConfig
) => {
  const {
    isAllLoaded,
    isAnyLoading,
    reset,
  } = useCoordinatedLoading(loadingStates, config);

  const SkeletonWrapper: React.FC<BaseWrapperProps> = ({ children, style, testID }) => {
    if (isAllLoaded) return null;
    return (
      <Container style={style} testID={testID}>
        {children}
      </Container>
    );
  };

  const ContentWrapper: React.FC<BaseWrapperProps> = ({ children, style, testID }) => {
    if (!isAllLoaded) return null;
    return (
      <Container style={style} testID={testID}>
        {children}
      </Container>
    );
  };

  return {
    SkeletonWrapper,
    ContentWrapper,
    reset,
    isAllLoaded,
    isAnyLoading,
  };
};

export default CoordinatedLoadingWrapper;