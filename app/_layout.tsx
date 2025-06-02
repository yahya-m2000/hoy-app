// Localization and API initialization (must be first)
import "@common/locales/i18n";
import "@common-services/apiInit";

// React imports
import React from "react";

// Third-party libraries
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// App context providers
import { ThemeProvider } from "@common-context/ThemeContext";
import { ToastProvider } from "@common-context/ToastContext";
import { AuthProvider } from "@common-context/AuthContext";
import { CurrencyProvider } from "@common-context/CurrencyContext";
import { DateSelectionProvider } from "@common-context/DateSelectionContext";
import { NetworkProvider } from "@common-context/NetworkContext";
import { UserRoleProvider, useUserRole } from "@common-context/UserRoleContext";

// App components
import OfflineNotice from "@common-components/OfflineNotice";
import RoleChangeLoadingOverlay from "@common-components/RoleChangeLoadingOverlay";

const RoleChangeLoadingOverlayWrapper = () => {
  const { isRoleLoading } = useUserRole();
  return <RoleChangeLoadingOverlay visible={isRoleLoading} />;
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NetworkProvider>
            <CurrencyProvider>
              <ThemeProvider>
                <UserRoleProvider>
                  <DateSelectionProvider>
                    <ToastProvider>
                      <StatusBar style="auto" />
                      <OfflineNotice />
                      <RoleChangeLoadingOverlayWrapper />
                      <Stack>
                        <Stack.Screen name="index" />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(screens)"
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)"
                          options={{
                            headerShown: false,
                            presentation: "modal",
                          }}
                        />
                        {/* <Stack.Screen
                            name="(screens)/common/conversation/[id]"
                            options={{
                              headerTitle: "Conversation",
                              headerShown: true,
                            }}
                          /> */}
                      </Stack>
                    </ToastProvider>
                  </DateSelectionProvider>
                </UserRoleProvider>
              </ThemeProvider>
            </CurrencyProvider>
          </NetworkProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
