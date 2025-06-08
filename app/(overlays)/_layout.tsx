import React from "react";
import { Stack } from "expo-router";

export default function OverlaysLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        animation: "slide_from_bottom",
      }}
    >
      {/* Utilities */}
      <Stack.Screen name="utilities" options={{ presentation: "modal" }} />

      {/* Common overlays */}
      <Stack.Screen name="common" options={{ presentation: "modal" }} />

      {/* Host overlays */}
      <Stack.Screen name="host" options={{ presentation: "modal" }} />

      {/* Traveler overlays */}
      <Stack.Screen name="traveler" options={{ presentation: "modal" }} />
    </Stack>
  );
}
