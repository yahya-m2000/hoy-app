/**
 * Traveler Index page - seamlessly transitions to home screen
 * Default landing page for travelers when they access the traveler tabs
 */

import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { AppInitializationScreen } from "@shared/components/feedback/Loading";

export default function TravelerIndex() {
  useEffect(() => {
    // Quick transition to home screen
    const timer = setTimeout(() => {
      router.replace("/(tabs)/traveler/home");
    }, 2000); // 5 seconds to see the gradient animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppInitializationScreen
        subtitle="Welcome back, traveler"
        showAnimation={true}
      />
    </>
  );
}
