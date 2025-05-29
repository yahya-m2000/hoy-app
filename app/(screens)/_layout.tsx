/**
 * Layout for full screens in the Hoy application
 */
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="property-details" />
    </Stack>
  );
}
