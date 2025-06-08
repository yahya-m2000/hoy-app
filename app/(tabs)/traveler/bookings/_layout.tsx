/**
 * Layout for booking-related screens
 */

import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";

export default function BookingsLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Bookings",
        }}
      />{" "}
      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: true,
          headerTitle: "Booking Details",
          headerBackTitle: "", // Set empty string to hide back title
        }}
      />{" "}
      <Stack.Screen
        name="property/[id]/index"
        options={{
          headerShown: true,
          headerTitle: "Property Details",
        }}
      />
    </Stack>
  );
}
