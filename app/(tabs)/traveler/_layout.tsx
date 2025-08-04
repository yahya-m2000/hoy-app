/**
 * Traveler Layout for Hoy application
 * Sets up tab navigation for traveler mode, only accessible when user is in traveler role
 * Includes home, search, bookings, messages, and profile tabs
 */

// React Native core
import React, { useRef, useState, useEffect } from "react";
import { Platform, Animated, Easing, View } from "react-native";
import ReanimatedAnimated, { useAnimatedStyle } from "react-native-reanimated";

// Expo and third-party libraries
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// App context
import { useTheme, useNavigationBarTheme } from "@core/hooks";
import { useUserRole } from "@core/context";

// Services
import { notificationService } from "@core/services/notification.service";

// Components
import { TravelerTabBarSkeleton } from "@shared/components/feedback/Loading";
import { getTabBarOpacity } from "@shared/stores/coordinatedLoadingStore";

const TravelerLayout = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { userRole, isRoleLoading } = useUserRole();
  const insets = useSafeAreaInsets();

  // Initialize navigation bar theming
  useNavigationBarTheme();

  // Animated values for tab bar slide animation and icon opacity
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const tabIconOpacity = useRef(new Animated.Value(1)).current;
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);

  // Notification unread count state
  const [unreadCount, setUnreadCount] = useState(0);

  // Get coordinated loading tab bar opacity
  const coordinatedTabBarOpacity = getTabBarOpacity();
  
  // Debug tab bar coordination
  React.useEffect(() => {
    console.log("🏷️ Tab Bar Debug:", {
      coordinatedTabBarOpacity: coordinatedTabBarOpacity?.value,
      hasCoordination: !!coordinatedTabBarOpacity,
    });
  }, [coordinatedTabBarOpacity]);

  // State to track if we're in loading mode (show skeletons by default on fresh load)
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  
  // Clear initial load state after coordination is established OR after timeout
  React.useEffect(() => {
    if (coordinatedTabBarOpacity) {
      setIsInitialLoad(false);
    } else {
      // Fallback: after 2 seconds, assume no coordination is coming
      const timeout = setTimeout(() => {
        setIsInitialLoad(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [coordinatedTabBarOpacity]);
  
  // Animated style for coordinated tab bar skeleton (inverse of tab bar opacity)
  const coordinatedTabBarSkeletonStyle = useAnimatedStyle(() => {
    if (coordinatedTabBarOpacity) {
      return {
        opacity: 1 - coordinatedTabBarOpacity.value, // Skeleton fades out as tabs fade in
      };
    }
    return {
      opacity: isInitialLoad ? 1 : 0, // Show skeleton on initial load, hide otherwise
    };
  }, [coordinatedTabBarOpacity, isInitialLoad]);

  // Animated style for real tab bar
  const coordinatedTabBarStyle = useAnimatedStyle(() => {
    if (coordinatedTabBarOpacity) {
      return {
        opacity: coordinatedTabBarOpacity.value, // Tab bar fades in
      };
    }
    return {
      opacity: isInitialLoad ? 0 : 1, // Hide tabs on initial load, show otherwise
    };
  }, [coordinatedTabBarOpacity, isInitialLoad]);

  // Track unread notifications
  useEffect(() => {
    const updateUnreadCount = () => {
      const notifications = notificationService.getNotificationHistory();
      const count = notifications.filter((n) => !n.read).length;
      setUnreadCount(count);
    };

    // Update count initially
    updateUnreadCount();

    // Set up a polling interval to check for changes
    const interval = setInterval(updateUnreadCount, 1000);
    return () => clearInterval(interval);
  }, []);

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
  );

  // Inbox Icon with Badge
  const InboxIconWithBadge = ({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) => (
    <Animated.View style={{ opacity: tabIconOpacity }}>
      <View style={{ position: "relative" }}>
        <Ionicons name="mail-outline" size={size} color={color} />
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -0,
              right: -2,
              backgroundColor: theme.colors.primary,
              borderRadius: 100,
              borderColor: theme.background,
              borderWidth: 2,
              minWidth: 6,
              height: 6,
              justifyContent: "center",
              alignItems: "center",
              padding: 3,
              // paddingHorizontal: 4,
            }}
          ></View>
        )}
      </View>
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
  if (!isRoleLoading && userRole === "host") {
    return <Redirect href="/(tabs)/host/today" />;
  }

  return (
    <>
      <Tabs
        initialRouteName="home"
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
              paddingBottom: Platform.OS === "android" ? 0 : insets.bottom,
              position: "absolute",
              // Only hide during role loading, not during home screen loading
              display: isRoleLoading ? "none" : "flex",
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
            title: t("common.tabs.home"),
            tabBarLabel: t("common.tabs.home"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: t("common.tabs.search"),
            tabBarLabel: t("common.tabs.search"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon
                name="search-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: t("common.tabs.bookings"),
            tabBarLabel: t("common.tabs.bookings"),
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
            title: t("common.tabs.wishlist"),
            tabBarLabel: t("common.tabs.wishlist"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: t("common.tabs.inbox"),
            tabBarLabel: t("common.tabs.inbox"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <InboxIconWithBadge color={color} size={size} />
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
          name="profile"
          options={{
            title: t("common.tabs.profile"),
            tabBarLabel: t("common.tabs.profile"),
            headerShown: false,
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

      {/* Tab Bar Skeleton Overlay - coordinates with screen loading */}
      {(coordinatedTabBarOpacity || isInitialLoad) && (
        <ReanimatedAnimated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: tabBarHeight,
              backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
              borderTopColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[200],
              borderTopWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              paddingBottom: Platform.OS === "android" ? 0 : insets.bottom,
            },
            coordinatedTabBarSkeletonStyle,
          ]}
        >
          {/* Tab Skeleton Items */}
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.skeleton,
                  marginBottom: 4,
                }}
              />
              <View
                style={{
                  width: 40,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: theme.skeleton,
                }}
              />
            </View>
          ))}
        </ReanimatedAnimated.View>
      )}
    </>
  );
};

export default TravelerLayout;
