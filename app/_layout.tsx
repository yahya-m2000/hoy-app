import "../src/core/utils/dev/metro-error-suppress";

// Localization and API initialization (must be first)
import "@core/locales/i18n";
import "@core/api/services";

// React imports
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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
import { router } from "expo-router";

// App navigation theming
import { useThemedScreenOptions } from "@core/navigation";

// App hooks
import { useFonts } from "@core/hooks";

// App context providers - Use the fixed ContextProviders wrapper
import { ContextProviders } from "@core/context/ContextProviders";
import RoleChangeLoadingOverlay from "@shared/components/feedback/Loading/RoleChangeLoadingOverlay";
import LoadingSpinner from "@shared/components/feedback/Loading/LoadingSpinner";

// Error boundary system
import { AppErrorBoundary } from "@core/error/GlobalErrorBoundary";
import { logger } from "@core/utils/sys/log/logger";

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
  // Import useAuth here to avoid circular dependency
  const { useAuth } = require("@core/context/AuthContext");
  const { isAuthChecked, checkAuthenticationState } = useAuth();
  const [timedOut, setTimedOut] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthChecked && !timedOut) {
      const timeout = setTimeout(() => setTimedOut(true), 10000);
      return () => clearTimeout(timeout);
    }
    if (isAuthChecked) {
      setTimedOut(false);
    }
  }, [isAuthChecked, timedOut]);

  const handleRetry = async () => {
    setRetrying(true);
    setTimedOut(false);
    await checkAuthenticationState();
    setRetrying(false);
  };

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

// Wrapper component to use hook within Provider context
const RoleChangeLoader = () => {
  // Import useUserRole here to avoid circular dependency
  const { useUserRole } = require("@core/context/UserRoleContext");
  const { isRoleLoading, userRole } = useUserRole();
  const prevLoading = React.useRef<boolean>(isRoleLoading);
  const hasNavigated = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (prevLoading.current && !isRoleLoading && !hasNavigated.current) {
      // role change just finished
      hasNavigated.current = true;
      const target = userRole === "host" ? "/(tabs)/host" : "/(tabs)/traveler";
      router.replace(target);
    }
    prevLoading.current = isRoleLoading;
  }, [isRoleLoading]);

  return <RoleChangeLoadingOverlay visible={isRoleLoading} />;
};

// Removed ApiInterceptorTest component to prevent infinite loops

// Root layout component
export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ContextProviders features={{ calendar: true, properties: true }}>
          <FontLoader>
            <StatusBar style="auto" />
            <AuthLoadingOverlayWrapper />
            <RoleChangeLoader />
            <ThemedRootStack />
          </FontLoader>
        </ContextProviders>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
