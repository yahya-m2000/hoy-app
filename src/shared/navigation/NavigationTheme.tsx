/**
 * Navigation Theme Provider
 * Provides consistent header styling that matches CustomHeader design
 * Automatically applies to all screens where headerShown is true
 */

import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Icon } from "@shared/components/base";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/context";
import { fontSize, spacing } from "@shared/constants";

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

  // More robust check for whether we should show the back button
  // Based on React Navigation best practices
  const state = navigation.getState();

  // Don't render if no navigation state
  if (!state) {
    return null;
  }

  // Only show back button if:
  // 1. We have navigation state
  // 2. The current route index is greater than 0 (not the first screen in the stack)
  // 3. There are multiple routes in the stack
  const shouldShowBackButton =
    state.index > 0 && state.routes && state.routes.length > 1;

  if (!shouldShowBackButton) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        padding: spacing.xs,
        borderRadius: spacing.xs,
      }}
      activeOpacity={0.7}
    >
      {" "}
      <Icon
        name="arrow-back"
        size={22}
        color={
          darkMode
            ? themeData.colors.grayPalette[50]
            : themeData.colors.grayPalette[900]
        }
      />
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

  const titleColor = isDark ? theme.white : theme.black;
  const borderColor = isDark
    ? theme.colors.grayPalette[700]
    : theme.colors.grayPalette[300];

  // Conditionally include headerLeft only when appropriate
  const shouldShowBackButton = React.useMemo(() => {
    const state = navigation.getState();
    return state && state.index > 0 && state.routes && state.routes.length > 1;
  }, [navigation]);

  return {
    headerStyle: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      height: Platform.OS === "ios" ? 100 : 80,
    },
    headerTitleStyle: {
      fontSize: fontSize.md,
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
      paddingLeft: spacing.md,
    },
    headerRightContainerStyle: {
      paddingRight: spacing.md,
    },
    headerTitleContainerStyle: {
      paddingHorizontal: spacing.sm,
    },
    // Only include headerLeft when we should show back button
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
  const titleColor = isDark ? theme.white : theme.black;

  const borderColor = isDark
    ? theme.colors.grayPalette[700]
    : theme.colors.grayPalette[300];
  const themedOptions = {
    headerStyle: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      height: Platform.OS === "ios" ? 100 : 80,
    },
    headerTitleStyle: {
      fontSize: fontSize.lg,
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
      paddingLeft: spacing.md,
    },
    headerRightContainerStyle: {
      paddingRight: spacing.md,
    },
    headerTitleContainerStyle: {
      paddingHorizontal: spacing.sm,
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
