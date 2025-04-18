/**
 * Root layout for the Hoy application
 * Sets up providers and global navigation structure
 */

import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../src/context/ThemeContext";
import { ToastProvider } from "../src/context/ToastContext";
import "../src/locales/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";

// Create a client
const queryClient = new QueryClient();

// Root layout component
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <StatusBar style="auto" />
            {/* <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade_from_bottom",
              }}
            >
              <Stack.Screen name="(tabs)" />
            </Stack> */}
            <Slot />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
