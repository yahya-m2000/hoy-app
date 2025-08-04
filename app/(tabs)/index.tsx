/**
 * Default route for (tabs) directory
 * Shows initialization screen while determining role experience
 */

import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { useUserRole } from "@core/context/";
import { AppInitializationScreen } from "@shared/components/feedback/Loading";

export default function TabsIndex() {
  const { userRole, isRoleLoading } = useUserRole();

  useEffect(() => {
    if (!isRoleLoading && userRole) {
      // Smooth transition to the appropriate experience
      const timer = setTimeout(() => {
        const targetRoute = userRole === "host" ? "host" : "traveler";
        router.replace(targetRoute);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userRole, isRoleLoading]);

  // Show initialization screen while determining role
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppInitializationScreen
        subtitle="Loading your dashboard..."
        showAnimation={true}
      />
    </>
  );
}
