/**
 * Traveler Layout for Hoy application
 * Sets up tab navigation for traveler mode, only accessible when user is in traveler role
 * Includes home, search, bookings, messages, and profile tabs
 */

// React Native core
import React from "react";
import { Platform } from "react-native";

// Expo and third-party libraries
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// App context
import { useTheme } from "@common-context/ThemeContext";
import { useUserRole } from "@common-context/UserRoleContext";

const TravelerLayout = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost, isRoleLoading } = useUserRole();
  const insets = useSafeAreaInsets();

  // Adjusted tab bar height including bottom inset for safe area
  const tabBarHeight = Platform.OS === "ios" ? 50 + insets.bottom : 60;
  // Use declarative Redirect instead of imperative navigation
  if (!isRoleLoading && isHost) {
    return <Redirect href="/(tabs)/host/dashboard" />;
  }

  // Show nothing while loading to avoid flicker
  if (isRoleLoading) {
    return null;
  }
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark
          ? theme.colors.gray[400]
          : theme.colors.gray[500],
        tabBarStyle: {
          backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
          borderTopColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[200],
          height: tabBarHeight,
          paddingBottom: insets.bottom,
        },
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
            <Ionicons name="home-outline" size={size} color={color} />
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
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t("navigation.bookings"),
          tabBarLabel: t("navigation.bookings"),
          headerTitle: t("navigation.bookings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="inbox"
        options={{
          title: t("navigation.inbox"),
          tabBarLabel: t("navigation.inbox"),
          headerTitle: t("navigation.inbox"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="account"
        options={{
          title: t("navigation.account"),
          tabBarLabel: t("navigation.account"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TravelerLayout;
