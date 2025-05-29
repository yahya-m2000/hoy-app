/**
 * Layout for conversation screens
 */
import React from "react";
import { Stack } from "expo-router";

export default function ConversationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerTitle: "Conversation",
      }}
    />
  );
}
