/**
 * Account section layout
 * Handles navigation for account-related screens
 */

import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@core/navigation";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ headerShown: false }} />
    </Stack>
  );
}
