/**
 * Layout for common modal screens
 */
import { Stack } from "expo-router";

export default function CommonModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
