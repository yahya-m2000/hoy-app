/**
 * Navigation Theme Provider
 * Provides consistent header styling that matches CustomHeader design
 * Automatically applies to all screens where headerShown is true
 *
 * @module @core/navigation/NavigationTheme
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Icon } from "@shared/components/base/Icon";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@core/hooks/useTheme";
import { fontSize, spacing } from "@core/design";
import { logger } from "../utils/sys/log";

/**
 * Custom back button component that only renders when navigation can go back
 * This is specifically designed to work with Expo Router navigation structure
 */
const CustomBackButton = ({
  isDark,
  theme,
}: { isDark?: boolean; theme?: any } = {}) => {
  const themeContext = useTheme();
  const navigation = useNavigation();

  // Use passed props or fall back to context
  const darkMode = isDark !== undefined ? isDark : themeContext.isDark;
  const themeData = theme || themeContext.theme;
  // Safe color extraction with fallbacks
  const getBackButtonColor = () => {
    try {
      if (darkMode) {
        return themeData?.colors?.gray?.[50] || "#ffffff";
      } else {
        return themeData?.colors?.gray?.[900] || "#000000";
      }
    } catch (error) {
      logger.warn("Error getting back button color:", error);
      return darkMode ? "#ffffff" : "#000000";
    }
  };

  // More robust check for whether we should show the back button
  // Based on React Navigation best practices
  let shouldShowBackButton = false;

  try {
    const state = navigation.getState();

    // Don't render if no navigation state
    if (!state) {
      return null;
    }

    // Only show back button if:
    // 1. We have navigation state
    // 2. The current route index is greater than 0 (not the first screen in the stack)
    // 3. There are multiple routes in the stack
    shouldShowBackButton =
      typeof state.index === "number" &&
      state.index > 0 &&
      Array.isArray(state.routes) &&
      state.routes.length > 1;
  } catch (error) {
    logger.warn("Error checking navigation state:", error);
    return null;
  }

  if (!shouldShowBackButton) {
    return null;
  }

  const handleBackPress = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      logger.warn("Error navigating back:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleBackPress}
      style={{
        padding: spacing?.xs || 8,
        borderRadius: spacing?.xs || 4,
      }}
      activeOpacity={0.7}
    >
      <Icon name="arrow-back" size={22} color={getBackButtonColor()} />
    </TouchableOpacity>
  );
};

interface NavigationThemeConfig {
  headerStyle: {
    backgroundColor: string;
    borderBottomWidth: number;
    borderBottomColor: string;
    height: number;
  };
  headerTitleStyle: {
    fontSize: number;
    fontWeight: "400" | "500" | "600" | "700";
    color: string;
  };
  headerTitleAlign: "center";
  headerBackButtonDisplayMode: "minimal" | "default" | "generic";
  headerBackTitle: string;
  headerTransparent: boolean;
  headerBlurEffect:
    | "light"
    | "dark"
    | "regular"
    | "prominent"
    | "systemUltraThinMaterial"
    | "systemThinMaterial"
    | "systemMaterial"
    | "systemThickMaterial"
    | "systemChromeMaterial"
    | "systemChromeMaterialDark"
    | "systemChromeMaterialLight"
    | "systemUltraThinMaterialLight";
  headerTintColor: string;
  headerShadowVisible: boolean;
  headerLeftContainerStyle: {
    paddingLeft: number;
  };
  headerRightContainerStyle: {
    paddingRight: number;
  };
  headerTitleContainerStyle: {
    paddingHorizontal: number;
  };
  headerLeft?: () => React.ReactElement;
}

export const useNavigationTheme = (): NavigationThemeConfig => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  // Safe color extraction with fallbacks
  const getTitleColor = () => {
    try {
      return theme?.text?.primary || (isDark ? "#ffffff" : "#000000");
    } catch (error) {
      logger.warn("Error getting title color:", error);
      return isDark ? "#ffffff" : "#000000";
    }
  };
  const getBorderColor = () => {
    try {
      return isDark
        ? theme?.colors?.gray?.[700] || "#374151"
        : theme?.colors?.gray?.[300] || "#d1d5db";
    } catch (error) {
      logger.warn("Error getting border color:", error);
      return isDark ? "#374151" : "#d1d5db";
    }
  };

  const titleColor = getTitleColor();
  const borderColor = getBorderColor();

  // Conditionally include headerLeft only when appropriate
  const shouldShowBackButton = React.useMemo(() => {
    try {
      const state = navigation?.getState();
      return (
        state &&
        typeof state.index === "number" &&
        state.index > 0 &&
        Array.isArray(state.routes) &&
        state.routes.length > 1
      );
    } catch (error) {
      logger.warn(
        "Error checking navigation state in useNavigationTheme:",
        error
      );
      return false;
    }
  }, [navigation]);
  return {
    headerStyle: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      height: Platform.OS === "ios" ? 100 : 80,
    },
    headerTitleStyle: {
      fontSize: fontSize?.md || 16,
      fontWeight: "500",
      color: titleColor,
    },
    headerTitleAlign: "center" as const,
    headerTransparent: true,
    headerBlurEffect: "regular",
    headerBackTitle: "",
    headerTintColor: titleColor,
    headerBackButtonDisplayMode: "minimal",
    headerShadowVisible: true,
    headerLeftContainerStyle: {
      paddingLeft: spacing?.md || 16,
    },
    headerRightContainerStyle: {
      paddingRight: spacing?.md || 16,
    },
    headerTitleContainerStyle: {
      paddingHorizontal: spacing?.sm || 12,
    }, // Only include headerLeft when we should show back button
    ...(shouldShowBackButton && {
      headerLeft: () => <CustomBackButton />,
    }),
  };
};

/**
 * Higher-order component to apply navigation theme automatically
 */
export const withNavigationTheme = (
  WrappedComponent: React.ComponentType<any>
) => {
  return function ThemedNavigationComponent(props: any) {
    const navigationTheme = useNavigationTheme();

    return <WrappedComponent {...props} screenOptions={navigationTheme} />;
  };
};

/**
 * Hook to get screen options with theme applied
 * Use this in individual layouts for more control
 */
export const useThemedScreenOptions = (
  overrides: Partial<NavigationThemeConfig> = {}
) => {
  const baseTheme = useNavigationTheme();

  return {
    ...baseTheme,
    ...overrides,
  };
};

/**
 * Helper function to apply themed header options to any screen
 * Use this when you need to quickly add themed headers to existing screens
 */
export const getThemedHeaderOptions = (options: any = {}) => {
  // This is a hook wrapper that can be used in layouts
  return (props: any) => {
    const themedOptions = useThemedScreenOptions();
    return {
      ...themedOptions,
      ...options,
    };
  };
};

/**
 * Simple function to merge themed options with custom options
 * Use this for static header configurations
 * Note: This function does not include conditional headerLeft logic
 * and should only be used for screens that definitively need a back button
 */
export const mergeWithThemedOptions = (
  customOptions: any,
  isDark: boolean,
  theme: any,
  includeBackButton: boolean = false
) => {
  // Safe color extraction with fallbacks
  const getTitleColor = () => {
    try {
      return theme?.text?.primary || (isDark ? "#ffffff" : "#000000");
    } catch (error) {
      logger.warn(
        "Error getting title color in mergeWithThemedOptions:",
        error
      );
      return isDark ? "#ffffff" : "#000000";
    }
  };
  const getBorderColor = () => {
    try {
      return isDark
        ? theme?.colors?.gray?.[700] || "#374151"
        : theme?.colors?.gray?.[300] || "#d1d5db";
    } catch (error) {
      logger.warn(
        "Error getting border color in mergeWithThemedOptions:",
        error
      );
      return isDark ? "#374151" : "#d1d5db";
    }
  };

  const titleColor = getTitleColor();
  const borderColor = getBorderColor();

  const themedOptions = {
    headerStyle: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      height: Platform.OS === "ios" ? 100 : 80,
    },
    headerTitleStyle: {
      fontSize: fontSize?.lg || 18,
      fontWeight: "600" as const,
      color: titleColor,
    },
    headerTitleAlign: "center" as const,
    headerBackTitle: "",
    headerTintColor: titleColor,
    headerTransparent: true,
    headerBlurEffect: "regular",
    headerShadowVisible: true,
    headerLeftContainerStyle: {
      paddingLeft: spacing?.md || 16,
    },
    headerRightContainerStyle: {
      paddingRight: spacing?.md || 16,
    },
    headerTitleContainerStyle: {
      paddingHorizontal: spacing?.sm || 12,
    },
    // Only include headerLeft if explicitly requested
    ...(includeBackButton && {
      headerLeft: () => <CustomBackButton isDark={isDark} theme={theme} />,
    }),
  };

  return {
    ...themedOptions,
    ...customOptions,
  };
};
