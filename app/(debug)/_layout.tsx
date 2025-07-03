/**
 * Debug Layout
 * Development and testing screens
 */

import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@core/hooks/useTheme";

export default function DebugLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "default",
      }}
    >
      <Stack.Screen name="font-test" options={{ headerShown: false }} />
      <Stack.Screen name="token-debug" options={{ headerShown: false }} />
    </Stack>
  );
}
