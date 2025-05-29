/**
 * Common Screens Layout for Hoy application
 * This layout handles screens that are shared between host and traveler experiences
 */

import React from "react";
import { Stack } from "expo-router";

export default function CommonScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    />
  );
}
