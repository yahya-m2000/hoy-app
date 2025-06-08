/**
 * Layout for host modal screens
 */
import { Stack } from "expo-router";

export default function HostModalsLayout() {
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
      <Stack.Screen name="property-type" />
    </Stack>
  );
}
