/**
 * Main tab navigation layout for the Hoy application
 */

import { Tabs } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useConversations } from "../../src/hooks/useConversations";
import { useNotifications } from "../../src/hooks/useNotifications";

// Import directly from constants for fallback
import { fontSize, fontWeight } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { gray, primary } from "../../src/constants/colors";

// Create a proper fallback with the right structure
const fallbackTheme = {
  // Basic colors
  primary: primary[600],
  primaryLight: primary[100],
  secondary: "#7F56D9",
  secondaryLight: "#F4EBFF",
  success: "#039855",
  error: "#D92D20",
  warning: "#DC6803",
  info: "#0086C9",
  white: "#FFFFFF",
  black: "#000000",

  // Color palettes as direct properties
  gray,

  // Add a colors property to match expected structure
  colors: {
    gray,
    primary,
    // Add other color palettes here if needed
  },

  // Typography properties
  fontSize,
  fontWeight,

  // Spacing properties
  spacing,
};

const TabLayout = () => {
  const { t } = useTranslation();
  // Get unread counts from both hooks instead of using MessageContext
  const { totalUnreadCount: unreadMessageCount = 0 } = useConversations();
  const { totalUnreadCount: unreadNotificationCount = 0 } = useNotifications();

  // Calculate the total unread count across all message types
  const totalUnreadCount = unreadMessageCount + unreadNotificationCount;

  let theme;
  let isDark = false;
  try {
    // Try to use the ThemeContext
    const themeContext = useTheme();
    theme = themeContext.theme;
    isDark = themeContext.isDark;
  } catch (error) {
    // If not available, use our fallback
    console.log("ThemeProvider not available, using fallback theme", error);
    theme = fallbackTheme;
  }

  return (
    <Tabs
      initialRouteName="home/index"
      screenOptions={{
        tabBarActiveTintColor: theme.primary?.[500] ?? theme.primary,
        tabBarInactiveTintColor: isDark
          ? theme.colors && theme.colors.gray
            ? theme.colors.gray[400]
            : theme.colors.gray?.[400] ?? "#9CA3AF"
          : theme.colors && theme.colors.gray
          ? theme.colors.gray[500]
          : theme.colors.gray?.[500] ?? "#6B7280",
        tabBarStyle: {
          backgroundColor: isDark
            ? theme.colors && theme.colors.gray
              ? theme.colors.gray[900]
              : theme.colors.gray?.[900] ?? "#111827"
            : theme.white ?? "#FFFFFF",
          borderTopColor: isDark
            ? theme.colors && theme.colors.gray
              ? theme.colors.gray[800]
              : theme.colors.gray?.[800] ?? "#1F2937"
            : theme.colors && theme.colors.gray
            ? theme.colors.gray[200]
            : theme.colors.gray?.[200] ?? "#E5E7EB",
        },
        headerStyle: {
          backgroundColor: isDark
            ? theme.colors && theme.colors.gray
              ? theme.colors.gray[900]
              : theme.colors.gray?.[900] ?? "#111827"
            : theme.white ?? "#FFFFFF",
        },
        headerTintColor: isDark
          ? theme.white ?? "#FFFFFF"
          : theme.colors && theme.colors.gray
          ? theme.colors.gray[900]
          : theme.colors.gray?.[900] ?? "#111827",
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: t("navigation.home"),
          tabBarLabel: t("navigation.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: t("navigation.search"),
          tabBarLabel: t("navigation.search"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: t("navigation.bookings"),
          tabBarLabel: t("navigation.bookings"),
          headerTitle: t("navigation.bookings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{
          title: t("navigation.inbox"),
          tabBarLabel: t("navigation.inbox"),
          headerTitle: t("navigation.inbox"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbox-ellipses-outline"
              size={size}
              color={color}
            />
          ),
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined, // Show badge when there are unread messages
        }}
      />
      <Tabs.Screen
        name="account/index"
        options={{
          title: t("navigation.account"),
          tabBarLabel: t("navigation.account"),
          headerTitle: t("navigation.account"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

// Make sure to export the component as default
export default TabLayout;
