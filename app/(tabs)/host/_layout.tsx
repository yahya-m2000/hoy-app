/**
 * Host Layout for Hoy application
 * Sets up tab navigation for host mode, only accessible when user is in host role
 * Includes dashboard, properties, reservations, earnings, messages, and settings tabs
 */

// React Native core
import React, { useRef, useState } from "react";
import { Platform, Animated, Easing } from "react-native";

// Expo and third-party libraries
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// App context
import { useTheme } from "@shared/hooks/useTheme";
import { useUserRole } from "@shared/context";

// Global state for edit modal communication
let globalAnimateTabBarFn: ((hide: boolean) => void) | null = null;

export const setEditModalVisible = (visible: boolean) => {
  console.log(`setEditModalVisible called with: ${visible}`);
  if (globalAnimateTabBarFn !== null) {
    console.log("Calling globalAnimateTabBarFn");
    (globalAnimateTabBarFn as (hide: boolean) => void)(visible);
  } else {
    console.log("globalAnimateTabBarFn is null");
  }
};

const HostLayout = () => {
  const { theme, isDark } = useTheme();
  const { isHost, isRoleLoading } = useUserRole();
  const insets = useSafeAreaInsets();

  // Animated values for tab bar slide animation and icon opacity
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const tabIconOpacity = useRef(new Animated.Value(1)).current;
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);

  // Adjusted tab bar height including bottom inset for safe area
  const tabBarHeight = Platform.OS === "ios" ? 50 + insets.bottom : 60;
  // Function to animate tab bar with smooth easing
  const animateTabBar = (hide: boolean) => {
    console.log(
      `Host layout animateTabBar called with: ${hide}, current shouldHideTabBar: ${shouldHideTabBar}`
    );
    if (hide === shouldHideTabBar) return; // Don't animate if already in the desired state

    setShouldHideTabBar(hide);
    console.log(`Starting tab bar animation: ${hide ? "hiding" : "showing"}`);

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
    ]).start(() => {
      console.log(`Tab bar animation completed: ${hide ? "hidden" : "shown"}`);
    });
  };

  // Set global function reference
  globalAnimateTabBarFn = animateTabBar;

  // Check if we should hide the tab bar based on current navigation state
  const isOnEditModalScreen = (navigationState: any) => {
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

      // Check if we're on the calendar screen and there's an edit modal visible
      // This is a placeholder - we'll need to pass edit modal state somehow
      // For now, let's check if we're on calendar and have specific params
      if (currentTabRoute.name === "calendar" && routeName === "index") {
        // We could check for specific params or use a different approach
        return false; // Will be controlled by the edit modal component directly
      }

      return false;
    } catch {
      return false;
    }
  };

  // Animated Icon Wrapper Component
  const AnimatedTabIcon = ({
    name,
    color,
    size,
  }: {
    name: any;
    color: string;
    size: number;
  }) => (
    <Animated.View style={{ opacity: tabIconOpacity }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );

  // Use declarative Redirect instead of imperative navigation
  if (!isRoleLoading && !isHost) {
    return <Redirect href="/(tabs)/traveler" />;
  }

  // Show nothing while loading to avoid flicker
  if (isRoleLoading) {
    return null;
  }

  // Export the animateTabBar function to global scope for use by edit modal
  (global as any).hostTabBarAnimate = animateTabBar;

  return (
    <BottomSheetModalProvider>
      <Tabs
        screenOptions={{
          animation: "fade",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDark
            ? theme.colors.gray[400]
            : theme.colors.gray[500],
          tabBarStyle: [
            {
              backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
              borderTopColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[200],
              height: tabBarHeight,
              paddingBottom: insets.bottom,
              position: "absolute",
            },
            {
              transform: [{ translateY: tabBarTranslateY }],
            },
          ],
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
          headerStyle: {
            backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
          },
          headerTintColor: isDark ? theme.white : theme.colors.gray[900],
          headerShadowVisible: false,
          headerShown: false,
        }}
        screenListeners={{
          state: (e) => {
            // Check if we should hide the tab bar based on current navigation state
            const shouldHide = isOnEditModalScreen(e.data.state);
            animateTabBar(shouldHide);
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null, // This completely hides the tab from the tab bar
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="today"
          options={{
            title: "Today",
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon name="today-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon
                name="calendar-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="listings"
          options={{
            title: "Listings",
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon
                name="settings-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </BottomSheetModalProvider>
  );
};

export default HostLayout;
