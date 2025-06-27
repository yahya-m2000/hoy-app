/**
 * Layout for properties property screens
 */

import { Stack } from "expo-router";

export default function PropertiesPropertyLayout() {
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
