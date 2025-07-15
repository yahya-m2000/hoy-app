/**
 * Host Layout for Hoy application
 * Sets up tab navigation for host mode, only accessible when user is in host role
 * Includes dashboard, properties, reservations, earnings, messages, and settings tabs
 */

// React Native core
import React from "react";
import { Platform, Animated } from "react-native";
import { useTranslation } from "react-i18next";

// Expo and third-party libraries
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// App context
import { useTheme } from "@core/hooks";
import { useUserRole } from "@core/context";
import {
  useTabBarVisibility,
  isOnAddPropertyScreen,
} from "@core/navigation/useTabBarVisibility";
import { useHostSetupStatus } from "@features/host/hooks";

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
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { userRole, isRoleLoading } = useUserRole();
  const insets = useSafeAreaInsets();
  const { tabBarTranslateY, tabIconOpacity, animateTabBar, tabBarHeight } =
    useTabBarVisibility();

  // Check host setup status
  const {
    setupStatus,
    isLoading: isSetupLoading,
    setupModalVisible,
    showSetupModal,
    hideSetupModal,
    handleSetupComplete,
  } = useHostSetupStatus();

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

  // Check if we're on a property details screen
  const isOnPropertyDetailsScreen = (navigationState: any) => {
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

      // Check for property details screen in listings tab
      if (
        currentTabRoute.name === "listings" &&
        routeName === "details/index"
      ) {
        return true;
      }

      // Check for booking details screen in today tab
      if (currentTabRoute.name === "today" && routeName === "[bookingId]") {
        return true;
      }

      // Check for nested property details routes
      if (currentScreenRoute?.state) {
        const nestedState = currentScreenRoute.state;
        const nestedRoute = nestedState.routes?.[nestedState.index];
        if (
          nestedRoute?.name === "details/index" ||
          nestedRoute?.name?.includes("property")
        ) {
          return true;
        }
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
  if (!isRoleLoading && userRole !== "host") {
    return <Redirect href="/(tabs)/traveler" />;
  }

  // Don't automatically show setup modal - let users navigate to today page
  // which will show setup prompts when needed

  // Export the animateTabBar function to global scope for use by edit modal
  (global as any).hostTabBarAnimate = animateTabBar;

  return (
    <>
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
              fontFamily: "Satoshi-Medium",
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
              const shouldHide =
                isOnEditModalScreen(e.data.state) ||
                isOnAddPropertyScreen(e.data.state) ||
                isOnPropertyDetailsScreen(e.data.state);
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
          {/* <Tabs.Screen
            name="insights"
            options={{
              href: null, // This completely hides the tab from the tab bar
              headerShown: false,
            }}
          /> */}
          {/* <Tabs.Screen
            name="setup"
            options={{
              href: null, // This completely hides the tab from the tab bar
              headerShown: false,
            }}
          /> */}
          <Tabs.Screen
            name="insights/[propertyId]"
            options={{
              href: null, // This completely hides the tab from the tab bar
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="today"
            options={{
              title: t("host.dashboard.title"),
              tabBarIcon: ({ color, size }) => (
                <AnimatedTabIcon
                  name="today-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: t("calendar.title"),
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
              title: t("navigation.listings"),
              tabBarIcon: ({ color, size }) => (
                <AnimatedTabIcon
                  name="home-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t("navigation.profile"),
              tabBarIcon: ({ color, size }) => (
                <AnimatedTabIcon
                  name="person-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </BottomSheetModalProvider>
    </>
  );
};

export default HostLayout;
