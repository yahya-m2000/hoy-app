/**
 * Inbox Layout for Traveler
 * Handles inbox navigation structure
 */

import { Stack } from "expo-router";

export default function InboxLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}