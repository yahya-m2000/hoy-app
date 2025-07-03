/**
 * Shared Tab Bar Utility
 * Provides functions to hide/show tab bar across the application
 *
 * @module @core/navigation/tabBarControl
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { useRef, useState } from "react";
import { Platform, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logger } from "../utils/sys/log";

export const useTabBarControl = () => {
  const insets = useSafeAreaInsets();

  // Animated values for tab bar slide animation and icon opacity
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const tabIconOpacity = useRef(new Animated.Value(1)).current;
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);

  // Adjusted tab bar height including bottom inset for safe area
  const tabBarHeight = Platform.OS === "ios" ? 50 + insets.bottom : 60;

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
    tabBarHeight,
    animateTabBar,
  };
};

// Global tab bar animation state
let globalTabBarAnimation: {
  tabBarTranslateY: Animated.Value;
  tabIconOpacity: Animated.Value;
  tabBarHeight: number;
} | null = null;

// Initialize global tab bar animation
export const initializeGlobalTabBar = (insets: { bottom: number }) => {
  const tabBarHeight = Platform.OS === "ios" ? 50 + insets.bottom : 60;
  globalTabBarAnimation = {
    tabBarTranslateY: new Animated.Value(0),
    tabIconOpacity: new Animated.Value(1),
    tabBarHeight,
  };
  return globalTabBarAnimation;
};

// Global tab bar control functions
export const hideTabBarGlobally = () => {
  logger.log(
    "hideTabBarGlobally called, globalTabBarAnimation:",
    globalTabBarAnimation
  );
  if (!globalTabBarAnimation) {
    logger.log("No global tab bar animation initialized!");
    return;
  }

  const { tabBarTranslateY, tabIconOpacity, tabBarHeight } =
    globalTabBarAnimation;

  logger.log("Hiding tab bar with height:", tabBarHeight);

  Animated.parallel([
    Animated.timing(tabBarTranslateY, {
      toValue: tabBarHeight + 20,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }),
    Animated.timing(tabIconOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }),
  ]).start(() => {
    logger.log("Tab bar hide animation completed");
  });
};

export const showTabBarGlobally = () => {
  logger.log(
    "showTabBarGlobally called, globalTabBarAnimation:",
    globalTabBarAnimation
  );
  if (!globalTabBarAnimation) {
    logger.log("No global tab bar animation initialized!");
    return;
  }

  const { tabBarTranslateY, tabIconOpacity } = globalTabBarAnimation;

  logger.log("Showing tab bar");

  Animated.parallel([
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }),
    Animated.timing(tabIconOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }),
  ]).start(() => {
    logger.log("Tab bar show animation completed");
  });
};

// Get global tab bar styles
export const getGlobalTabBarStyles = () => {
  if (!globalTabBarAnimation) return null;

  return {
    tabBarStyle: {
      transform: [{ translateY: globalTabBarAnimation.tabBarTranslateY }],
    },
    iconOpacity: globalTabBarAnimation.tabIconOpacity,
  };
};
