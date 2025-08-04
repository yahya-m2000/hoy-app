/**
 * TabBarSkeleton component
 * Modular skeleton for tab bars with support for different tab configurations
 * Used while role switching or during initial app load
 */

import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@rneui/base/dist';
import { Container } from '@shared/components/layout';
import { useTheme } from '@core/hooks';

interface TabBarSkeletonProps {
  /** Number of tabs to show skeleton for */
  tabCount?: number;
  /** Whether to show tab labels */
  showLabels?: boolean;
  /** Custom height override */
  height?: number;
}

export const TabBarSkeleton: React.FC<TabBarSkeletonProps> = ({
  tabCount = 5,
  showLabels = true,
  height,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = height || (Platform.OS === 'ios' ? 50 : 60);
  const skeletonColor = theme.skeleton;
  const backgroundColor = isDark ? theme.colors.gray[900] : theme.white;
  const borderColor = isDark ? theme.colors.gray[800] : theme.colors.gray[200];

  return (
    <Container
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: tabBarHeight,
        backgroundColor,
        borderTopWidth: 1,
        borderTopColor: borderColor,
        paddingBottom: insets.bottom,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
      }}
    >
      {Array.from({ length: tabCount }).map((_, index) => (
        <Container
          key={`tab-skeleton-${index}`}
          alignItems="center"
          justifyContent="center"
          style={{ flex: 1 }}
        >
          {/* Tab icon skeleton */}
          <Skeleton
            width={24}
            height={24}
            style={{
              borderRadius: 12,
              backgroundColor: theme.colors.gray[100],
              marginBottom: showLabels ? 4 : 0,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          
          {/* Tab label skeleton */}
          {showLabels && (
            <Skeleton
              width={40 + Math.random() * 20} // Vary width slightly for realism
              height={12}
              style={{
                borderRadius: 6,
                backgroundColor: theme.colors.gray[100],
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
          )}
        </Container>
      ))}
    </Container>
  );
};

export default TabBarSkeleton;