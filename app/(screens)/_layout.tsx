/**
 * Main layout for modal screens in the Hoy application
 * This provides the foundation for modal-style navigation with proper back button support
 */

import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@common-context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function ScreensLayout() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: isDark ? theme.white : theme.black,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackTitle: t("common.back"),
        headerShadowVisible: !isDark,
      }}
    >
      {/* Common screens */}
      <Stack.Screen
        name="common/personal-info"
        options={{
          title: t("account.personalInfo"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="common/privacy-security"
        options={{
          title: t("account.privacy.title"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="common/fix-account-data"
        options={{
          title: t("fixAccountData"),
          headerShown: true,
        }}
      />

      {/* Conversation screens */}
      <Stack.Screen
        name="common/conversation"
        options={{
          headerShown: false, // Conversations handle their own headers
        }}
      />

      {/* Traveler screens */}
      <Stack.Screen
        name="traveler/property-details"
        options={{
          title: t("property.details"),
          headerShown: false, // Property details handles its own header
        }}
      />
      <Stack.Screen
        name="traveler/search-results"
        options={{
          title: t("search.results"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="traveler/booking-confirmation"
        options={{
          title: t("booking.confirmation"),
          headerShown: false, // Booking confirmation handles its own header
          gestureEnabled: false, // Prevent dismissing booking confirmation
        }}
      />
    </Stack>
  );
}
