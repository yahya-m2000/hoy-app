/**
 * Traveler Layout for Hoy application
 * Sets up tab navigation for traveler mode, only accessible when user is in traveler role
 * Includes home, search, bookings, messages, and profile tabs
 */

// React Native core
import React, { useRef, useState } from "react";
import { Platform, Animated, Easing } from "react-native";

// Expo and third-party libraries
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// App context
import { useTheme } from "@shared/hooks/useTheme";
import { useUserRole } from "@shared/context";

const TravelerLayout = () => {
  const { t } = useTranslation();
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
  ); // Helper function to check if we're on a property details screen or search results
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
  }; // Use declarative Redirect instead of imperative navigation
  if (!isRoleLoading && isHost) {
    return <Redirect href="/(tabs)/host/today" />;
  }

  // Show nothing while loading to avoid flicker
  if (isRoleLoading) {
    return null;
  }
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        animation: "fade",
        tabBarActiveTintColor: theme.colors.primaryPalette[500],
        tabBarInactiveTintColor: isDark
          ? theme.colors.gray[400]
          : theme.colors.gray[500],
        tabBarStyle: [
          {
            backgroundColor: theme.background,
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
        tabBarHideOnKeyboard: true,
        headerStyle: {
          backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
        },
        headerTintColor: isDark ? theme.white : theme.colors.gray[900],
        headerShadowVisible: false,
      }}
      screenListeners={{
        state: (e) => {
          // Check if we should hide the tab bar based on current navigation state
          const shouldHide = isOnPropertyDetailsScreen(e.data.state);
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
        name="home"
        options={{
          title: t("navigation.home"),
          tabBarLabel: t("navigation.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AnimatedTabIcon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("navigation.search"),
          tabBarLabel: t("navigation.search"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AnimatedTabIcon name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t("navigation.bookings"),
          tabBarLabel: t("navigation.bookings"),
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
        name="wishlist"
        options={{
          title: t("navigation.wishlist"),
          tabBarLabel: t("navigation.wishlist"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AnimatedTabIcon name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          href: null, // This completely hides the tab from the tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("navigation.account"),
          tabBarLabel: t("navigation.account"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AnimatedTabIcon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TravelerLayout;
