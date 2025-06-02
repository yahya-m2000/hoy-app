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
        contentStyle: {
          backgroundColor: "transparent",
        },
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="language" />

      <Stack.Screen name="personal-info" />
      <Stack.Screen name="privacy-security" />
      <Stack.Screen name="fix-account-data" />
    </Stack>
  );
}
