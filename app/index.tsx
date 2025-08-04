/**
 * Root index file for Hoy application
 * Shows a seamless initialization screen while determining user role
 */

import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { useUserRole } from "@core/context";
import { AppInitializationScreen } from "@shared/components/feedback/Loading";

export default function Index() {
  const { userRole, isRoleLoading } = useUserRole();

  useEffect(() => {
    if (!isRoleLoading && userRole) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        const targetRoute =
          userRole === "host" ? "/(tabs)/host/today" : "/(tabs)/traveler/home";
        router.replace(targetRoute);
      }, 2000); // 5 seconds to see the gradient animation

      return () => clearTimeout(timer);
    }
  }, [userRole, isRoleLoading]);

  // Show initialization screen while loading or navigating
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppInitializationScreen
        subtitle="Preparing your experience..."
        showAnimation={true}
      />
    </>
  );
}
