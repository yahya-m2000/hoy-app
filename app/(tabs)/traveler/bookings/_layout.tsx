/**
 * Layout for booking-related screens
 */

import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@core/navigation";

export default function BookingsLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false, // Remove native header since we use base Header component
        }}
      />
      <Stack.Screen
        name="property"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
