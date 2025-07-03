/**
 * Onboarding Layout
 * Handles user onboarding flow
 */

import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@core/hooks/useTheme";

export default function OnboardingLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "default",
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="permissions" options={{ headerShown: false }} />
    </Stack>
  );
}
