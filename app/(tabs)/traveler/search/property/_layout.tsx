/**
 * Layout for search property screens
 */

import { Stack } from "expo-router";

export default function SearchPropertyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reviews/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="confirmation/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
