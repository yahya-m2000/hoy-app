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
import { router } from "expo-router";

// App navigation theming
import { useThemedScreenOptions } from "@core/navigation";

// App hooks
import { useFonts } from "@core/hooks";

// App context providers - Use the fixed ContextProviders wrapper
import { ContextProviders } from "@core/context/ContextProviders";
import { RoleChangeLoadingOverlay } from "@shared/components";

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

// Wrapper component to use hook within Provider context
const RoleChangeLoader = () => {
  // Import useUserRole here to avoid circular dependency
  const { useUserRole } = require("@core/context/UserRoleContext");
  const { isRoleLoading, userRole } = useUserRole();
  const prevLoading = React.useRef<boolean>(isRoleLoading);

  React.useEffect(() => {
    if (prevLoading.current && !isRoleLoading) {
      // role change just finished
      const target = userRole === "host" ? "/(tabs)/host" : "/(tabs)/traveler";
      router.replace(target);
    }
    prevLoading.current = isRoleLoading;
  }, [isRoleLoading, userRole]);

  return <RoleChangeLoadingOverlay visible={isRoleLoading} />;
};

// Test component to verify API interceptors
const ApiInterceptorTest = () => {
  React.useEffect(() => {
    const testInterceptors = async () => {
      try {
        logger.info(
          "[ApiInterceptorTest] 🔍 Testing API interceptors on app startup...",
          undefined,
          {
            module: "ApiInterceptorTest",
          }
        );

        // Test if interceptors are set up
        const {
          testAuthTokenInterceptor,
        } = require("@core/api/auth-token-interceptor");
        const interceptorWorking = await testAuthTokenInterceptor();

        logger.info(
          `[ApiInterceptorTest] Interceptor test result: ${
            interceptorWorking ? "✅ WORKING" : "❌ FAILED"
          }`,
          undefined,
          {
            module: "ApiInterceptorTest",
          }
        );

        if (interceptorWorking) {
          logger.info(
            "[ApiInterceptorTest] ✅ API interceptors are properly initialized",
            undefined,
            {
              module: "ApiInterceptorTest",
            }
          );
        } else {
          logger.error(
            "[ApiInterceptorTest] ❌ API interceptors are not working",
            undefined,
            {
              module: "ApiInterceptorTest",
            }
          );
        }
      } catch (error) {
        logger.error("[ApiInterceptorTest] Test failed", error, {
          module: "ApiInterceptorTest",
        });
      }
    };

    // Run test after a short delay to ensure everything is initialized
    setTimeout(testInterceptors, 1000);
  }, []);

  return null; // This component doesn't render anything
};

// Root layout component
export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ContextProviders features={{ calendar: true }}>
            <FontLoader>
              <StatusBar style="auto" />
              <ApiInterceptorTest />
              <AuthLoadingOverlayWrapper />
              <RoleChangeLoader />
              <ThemedRootStack />
            </FontLoader>
          </ContextProviders>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
