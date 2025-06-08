/**
 * Host Layout for Hoy application
 * Sets up tab navigation for host mode, only accessible when user is in host role
 * Includes dashboard, properties, reservations, earnings, messages, and settings tabs
 */

// React Native core
import React from "react";
import { Platform } from "react-native";

// Expo and third-party libraries
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// App context
import { useTheme, useUserRole } from "@shared/context";

const HostLayout = () => {
  const { theme, isDark } = useTheme();
  const { isHost, isRoleLoading } = useUserRole();
  const insets = useSafeAreaInsets();

  // Adjusted tab bar height including bottom inset for safe area
  const tabBarHeight = Platform.OS === "ios" ? 50 + insets.bottom : 60; // Use declarative Redirect instead of imperative navigation
  if (!isRoleLoading && !isHost) {
    return <Redirect href="/(tabs)/traveler" />;
  }

  // Show nothing while loading to avoid flicker
  if (isRoleLoading) {
    return null;
  }

  return (
    <Tabs
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
      {" "}
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
            <Ionicons name="today-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: "Listings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default HostLayout;
