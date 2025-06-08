// Localization and API initialization (must be first)
import "@shared/locales/i18n";
import "@shared/services/api/";

// React imports
import React from "react";

// Third-party libraries
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// App navigation theming
import { useThemedScreenOptions } from "@shared/navigation";

// App context providers
import {
  ThemeProvider,
  ToastProvider,
  AuthProvider,
  useAuth,
  CurrencyProvider,
  DateSelectionProvider,
  NetworkProvider,
  UserRoleProvider,
  useUserRole,
} from "@shared/context";

// App components
import {
  OfflineNotice,
  RoleChangeLoadingOverlay,
  AuthLoadingOverlay,
} from "@shared/components/common";

const RoleChangeLoadingOverlayWrapper = () => {
  const { isRoleLoading } = useUserRole();
  return <RoleChangeLoadingOverlay visible={isRoleLoading} />;
};

const AuthLoadingOverlayWrapper = () => {
  const { isAuthChecked } = useAuth();
  return <AuthLoadingOverlay visible={!isAuthChecked} />;
};

// Themed Stack component for root navigation
const ThemedRootStack = () => {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(stack)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(overlays)"
        options={{
          headerShown: false,
          presentation: "modal",
          contentStyle: { backgroundColor: "transparent" },
          headerStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
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
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NetworkProvider>
              <CurrencyProvider>
                <ThemeProvider>
                  <UserRoleProvider>
                    <DateSelectionProvider>
                      <ToastProvider>
                        {" "}
                        <StatusBar style="auto" />
                        <OfflineNotice />
                        <RoleChangeLoadingOverlayWrapper />
                        <AuthLoadingOverlayWrapper />
                        <ThemedRootStack />
                      </ToastProvider>
                    </DateSelectionProvider>
                  </UserRoleProvider>
                </ThemeProvider>
              </CurrencyProvider>
            </NetworkProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
