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
import { ChatProvider } from "@common-context/ChatContext";

// App components
import OfflineNotice from "@common-components/OfflineNotice";
import RoleChangeLoadingOverlay from "@common-components/RoleChangeLoadingOverlay";

const RoleChangeLoadingOverlayWrapper = () => {
  const { isRoleLoading } = useUserRole();
  return <RoleChangeLoadingOverlay visible={isRoleLoading} />;
};

// Create a client
const queryClient = new QueryClient();

// Root layout component
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NetworkProvider>
            <CurrencyProvider>
              {/* <ChatProvider> */}
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
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(modals)"
                          options={{ headerShown: false }}
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
              {/* </ChatProvider> */}
            </CurrencyProvider>
          </NetworkProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
