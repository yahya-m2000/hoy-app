/**
 * Layout for traveler modal screens
 */
import { Stack } from "expo-router";

export default function TravelerModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        contentStyle: {
          backgroundColor: "transparent",
        },
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="availability-calendar" />
      <Stack.Screen name="cancellation-policy" />
      <Stack.Screen name="create-review" />
      <Stack.Screen name="house-rules" />
      <Stack.Screen name="reservation" />
      <Stack.Screen name="safety-and-property" />
      <Stack.Screen name="search-dates" />
      <Stack.Screen name="search-location" />
      <Stack.Screen name="search-travelers" />
    </Stack>
  );
}
