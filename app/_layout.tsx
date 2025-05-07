/**
 * Root layout for the Hoy application
 * Sets up providers and global navigation structure
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../src/context/ThemeContext";
import { ToastProvider } from "../src/context/ToastContext";
import "../src/locales/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { CurrencyProvider } from "../src/context/CurrencyContext";
import { DateSelectionProvider } from "../src/context/DateSelectionContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NetworkProvider } from "../src/context/NetworkContext";
import OfflineNotice from "../src/components/OfflineNotice";

// Import API initialization (sets up interceptors)
import "../src/services/apiInit";
import { MessageProvider } from "src/context/MessageContext";

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
              <MessageProvider>
                <ThemeProvider>
                  <DateSelectionProvider>
                    <ToastProvider>
                      <StatusBar style="auto" />
                      <OfflineNotice />
                      <Stack>
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(screens)/PropertyModalScreen"
                          options={{
                            presentation: "modal",
                            title: "Property Details",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/SearchLocationModal"
                          options={{
                            presentation: "modal",
                            contentStyle: { backgroundColor: "transparent" },
                            animation: "slide_from_bottom",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/SearchDateModal"
                          options={{
                            presentation: "modal",
                            contentStyle: { backgroundColor: "transparent" },
                            animation: "slide_from_bottom",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/SearchTravelersModal"
                          options={{
                            presentation: "modal",
                            contentStyle: { backgroundColor: "transparent" },
                            animation: "slide_from_bottom",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/ReservationModal"
                          options={{
                            presentation: "modal",
                            title: "Reservation",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/AuthModal"
                          options={{
                            presentation: "modal",
                            title: "Sign In",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/ForgotPasswordModal"
                          options={{
                            presentation: "modal",
                            title: "Reset Password",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/ChangePasswordModal"
                          options={{
                            presentation: "modal",
                            title: "Change Password",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/LanguageModal"
                          options={{
                            presentation: "modal",
                            title: "Language",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/CurrencyModal"
                          options={{
                            presentation: "modal",
                            title: "Currency",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/PropertyTypeModal"
                          options={{
                            presentation: "modal",
                            title: "Property Type",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/CreateReviewModal"
                          options={{
                            presentation: "modal",
                            title: "Write a Review",
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="(screens)/BookingConfirmationScreen"
                          options={{
                            title: "Booking Confirmed",
                          }}
                        />
                        <Stack.Screen
                          name="(screens)/PersonalInfoScreen"
                          options={{
                            title: "Personal Information",
                          }}
                        />
                        <Stack.Screen
                          name="(screens)/PrivacySecurityScreen"
                          options={{
                            title: "Privacy & Security",
                          }}
                        />{" "}
                        <Stack.Screen
                          name="(screens)/Results"
                          options={{
                            title: "Search Results",
                            headerShown: false,
                          }}
                        />
                      </Stack>
                    </ToastProvider>
                  </DateSelectionProvider>
                </ThemeProvider>
              </MessageProvider>
            </CurrencyProvider>
          </NetworkProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
