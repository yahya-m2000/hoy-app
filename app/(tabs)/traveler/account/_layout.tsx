/**
 * Account section layout
 * Handles navigation for account-related screens
 */

import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";

export default function AccountLayout() {
  const themedOptions = useThemedScreenOptions();
  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen
        name="index"
        options={{ headerShown: true, headerTitle: "Account" }}
      />
      <Stack.Screen
        name="personal-info/index"
        options={{
          headerShown: true,
          headerTitle: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="privacy-security/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="payment-methods/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
