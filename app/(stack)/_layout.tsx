import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@shared/hooks/useTheme";

export default function StackLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "default",
      }}
    >
      <Stack.Screen name="bookings" options={{ headerShown: false }} />
    </Stack>
  );
}
