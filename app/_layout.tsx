import "../src/core/utils/dev/metro-error-suppress";

// Localization and API initialization (must be first)
import "@core/locales/i18n";
import "@core/api/services";

// React imports
import React from "react";
import { View } from "react-native";

// Third-party libraries
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

// App navigation theming
import { useThemedScreenOptions } from "@core/navigation";

// App hooks
import { useFonts } from "@core/hooks";

// App context providers
import { ThemeProvider } from "@core/context/ThemeContext";
import { AuthProvider, useAuth } from "@core/context/AuthContext";
import { ToastProvider } from "@core/context/ToastContext";
import { NetworkProvider } from "@core/context/NetworkContext";
import { UserRoleProvider } from "@core/context/UserRoleContext";
import { DateSelectionProvider } from "@features/calendar/context/DateSelectionContext";

// Error boundary system
import { AppErrorBoundary } from "@core/error/GlobalErrorBoundary";
import { CalendarProvider } from "src/features/calendar/context/CalendarContext";

// Call preventAutoHideAsync as soon as possible to keep the splash screen visible until we decide to hide it manually.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Re-thrown errors can crash the app in dev – safely ignore. */
});

// Font loader component
const FontLoader = ({ children }: { children: React.ReactNode }) => {
  const { fontsLoaded } = useFonts();

  // When fonts are ready, hide the splash screen.
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore – the splash screen might already be hidden */
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Maintain a white background to avoid any black flicker.
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return <>{children}</>;
};

// Simplified loading components - remove complex overlays for now
const AuthLoadingOverlayWrapper = () => {
  const { isAuthChecked } = useAuth();
  if (!isAuthChecked) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }
  return null;
};

// Themed Stack component for root navigation
const ThemedRootStack = () => {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(debug)" options={{ headerShown: false }} />
    </Stack>
  );
};

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Root layout component
export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
          <QueryClientProvider client={queryClient}>
            <FontLoader>
              <AuthProvider>
                <NetworkProvider>
                  <ThemeProvider>
                    <CalendarProvider>
                      <DateSelectionProvider>
                        <UserRoleProvider>
                          <ToastProvider>
                            <StatusBar style="auto" />
                            <AuthLoadingOverlayWrapper />
                            <ThemedRootStack />
                          </ToastProvider>
                        </UserRoleProvider>
                      </DateSelectionProvider>
                    </CalendarProvider>
                  </ThemeProvider>
                </NetworkProvider>
              </AuthProvider>
            </FontLoader>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
