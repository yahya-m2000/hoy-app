import { useRef, useState } from 'react';
import { Animated, Platform, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTabBarVisibility = () => {
  const insets = useSafeAreaInsets();
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const tabIconOpacity = useRef(new Animated.Value(1)).current;
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);

  // Adjusted tab bar height including bottom inset for safe area
  const tabBarHeight = Platform.OS === 'ios' ? 50 + insets.bottom : 60;

  // Function to animate tab bar with smooth easing
  const animateTabBar = (hide: boolean) => {
    if (hide === shouldHideTabBar) return; // Don't animate if already in the desired state

    setShouldHideTabBar(hide);

    // Animate both tab bar position and icon opacity
    Animated.parallel([
      Animated.timing(tabBarTranslateY, {
        toValue: hide ? tabBarHeight + 20 : 0, // Add extra 20px to fully hide
        duration: 400, // 0.4 seconds for smooth animation
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease in-out cubic bezier
        useNativeDriver: true,
      }),
      Animated.timing(tabIconOpacity, {
        toValue: hide ? 0 : 1, // Fade out icons when hiding
        duration: hide ? 200 : 400, // Faster fade out, slower fade in
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    tabBarTranslateY,
    tabIconOpacity,
    shouldHideTabBar,
    animateTabBar,
    tabBarHeight,
  };
};

// Helper function to check if we're on a property details screen or search results
export const isOnPropertyDetailsScreen = (navigationState: any): boolean => {
  try {
    if (!navigationState) return false;

    const currentTabRoute = navigationState.routes[navigationState.index];
    if (!currentTabRoute?.state) return false;

    const tabState = currentTabRoute.state;
    const currentScreenIndex = tabState.index;

    if (
      currentScreenIndex === undefined ||
      !tabState.routes[currentScreenIndex]
    ) {
      return false;
    }

    const currentScreenRoute = tabState.routes[currentScreenIndex];
    const routeName = currentScreenRoute?.name || "";

    // Check for search results page
    if (routeName === "results" || routeName.includes("results")) {
      return true;
    }

    // Pattern matching for property details screens
    const isPropertyDetails =
      routeName === "[id]" || // Direct [id] routes (home/[id], search/[id], etc.)
      routeName.includes("property") || // wishlist/property, bookings/property
      (currentScreenRoute?.params && "id" in currentScreenRoute.params); // Any screen with id param

    // Special handling for nested routes like wishlist/property/[id]
    if (currentScreenRoute?.state) {
      const nestedState = currentScreenRoute.state;
      const nestedRoute = nestedState.routes?.[nestedState.index];
      if (
        nestedRoute?.name === "property/[id]" ||
        nestedRoute?.name?.includes("property") ||
        nestedRoute?.name === "results" ||
        nestedRoute?.name?.includes("results")
      ) {
        return true;
      }
    }

    // Additional check for wishlist property routes specifically
    if (
      currentTabRoute.name === "wishlist" &&
      currentScreenRoute?.name === "property/[id]"
    ) {
      return true;
    }

    return isPropertyDetails;
  } catch {
    return false;
  }
};

// Helper function to check if we're on add property screen
export const isOnAddPropertyScreen = (navigationState: any): boolean => {
  try {
    if (!navigationState) return false;

    const currentTabRoute = navigationState.routes[navigationState.index];
    if (!currentTabRoute?.state) return false;

    const tabState = currentTabRoute.state;
    const currentScreenIndex = tabState.index;

    if (
      currentScreenIndex === undefined ||
      !tabState.routes[currentScreenIndex]
    ) {
      return false;
    }

    const currentScreenRoute = tabState.routes[currentScreenIndex];
    const routeName = currentScreenRoute?.name || "";

    // Check for add property page
    return routeName === "add-property" || routeName.includes("add-property");
  } catch {
    return false;
  }
}; 