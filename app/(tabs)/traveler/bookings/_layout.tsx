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
        name="past/index"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
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
