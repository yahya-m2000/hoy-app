/**
 * Layout for modal screens in the Hoy application
 */
import { Stack } from "expo-router";

export default function ModalsLayout() {
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
    />
  );
}
