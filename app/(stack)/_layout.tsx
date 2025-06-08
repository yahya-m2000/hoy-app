import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@shared/context";

export default function StackLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="bookings" options={{ headerShown: false }} />
    </Stack>
  );
}
