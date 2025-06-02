/**
 * Conversation Layout for Hoy application
 * This layout handles the conversation screens that are shared between host and traveler
 */

import React from "react";
import { Stack } from "expo-router";

export default function ConversationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We'll handle headers in individual screens for better control
        presentation: "modal",
      }}
    />
  );
}
