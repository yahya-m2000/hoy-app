/**
 * Main Tabs Layout for Hoy application
 * This file serves as a router between the host and traveler tab experiences
 * based on the user's current role selection
 */

import React from "react";
import { Stack } from "expo-router";

// Context
import { useUserRole } from "@core/context/UserRoleContext";

// Main tabs layout serves as a router between host and traveler experiences
export default function TabsLayout() {
  const { isRoleLoading } = useUserRole(); // retained for potential future use

  // Render stack navigation for both host and traveler experiences
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="host" />
        <Stack.Screen name="traveler" />
      </Stack>
    </>
  );
}
