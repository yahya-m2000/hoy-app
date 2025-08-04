/**
 * Coordinated Loading Store
 * Simple store for sharing loading animation states across components
 * Allows tab bar to coordinate with current screen loading states
 */

import { SharedValue } from 'react-native-reanimated';

interface CoordinatedLoadingStore {
  tabBarOpacity: SharedValue<number> | null;
}

// Simple global store for coordinated loading
export const coordinatedLoadingStore: CoordinatedLoadingStore = {
  tabBarOpacity: null,
};

/**
 * Set the tab bar opacity shared value from a screen
 */
export const setTabBarOpacity = (opacity: SharedValue<number>) => {
  coordinatedLoadingStore.tabBarOpacity = opacity;
};

/**
 * Get the current tab bar opacity shared value
 */
export const getTabBarOpacity = (): SharedValue<number> | null => {
  return coordinatedLoadingStore.tabBarOpacity;
};

/**
 * Clear the tab bar opacity reference
 */
export const clearTabBarOpacity = () => {
  coordinatedLoadingStore.tabBarOpacity = null;
};

export default coordinatedLoadingStore;