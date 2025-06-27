import React from "react";
import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";

export default function SettingsLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...themedOptions,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="qr-code"
        options={{
          title: "My QR Code",
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
