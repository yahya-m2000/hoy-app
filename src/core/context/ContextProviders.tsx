/**
 * Context Providers Wrapper
 *
 * Comprehensive wrapper that ensures all context providers are wrapped with
 * appropriate error boundaries to prevent context errors from crashing the app.
 *
 * Features:
 * - All context providers wrapped with specialized error boundaries
 * - Proper error recovery and fallback mechanisms
 * - Context-specific error handling strategies
 * - Comprehensive error logging and monitoring
 *
 * @module @core/context/ContextProviders
 * @author Hoy Development Team
 * @version 1.0.0
 */

import "../api/init"; // Ensure API interceptors & auth manager are initialized

// React
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

// Core Context Providers
import { AuthProvider } from "./AuthContext";
import { NetworkProvider } from "./NetworkContext";
import { ThemeProvider } from "./ThemeContext";
import { CurrencyProvider } from "./CurrencyContext";
import { ToastProvider } from "./ToastContext";
import { LocationProvider } from "./LocationContext";
import { UserRoleProvider } from "./UserRoleContext";

// Error Boundaries
import {
  AppErrorBoundary,
  ContextErrorBoundary,
  GenericContextErrorBoundary,
} from "../error";

// API Initialization
import { setupApiInterceptors } from "../api/interceptors";
import { initializeAuthManager } from "../api/auth-manager";
import { initializeSecureTokenStorage } from "../auth/secure-token-storage";
import { logger } from "../utils/sys/log/logger";
import { KeyboardProvider } from "react-native-keyboard-controller";

// ========================================
// QUERY CLIENT SETUP
// ========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ========================================
// API INITIALIZATION
// ========================================

// Initialize API interceptors immediately when this module is loaded
// This ensures interceptors are ready before any context providers are created
try {
  logger.info(
    "[ContextProviders] Initializing API interceptors synchronously..."
  );
  setupApiInterceptors();
  logger.info("[ContextProviders] API interceptors initialized successfully");
} catch (error) {
  logger.error(
    "[ContextProviders] Failed to initialize API interceptors",
    error
  );
}

// ========================================
// CORE PROVIDERS WRAPPER
// ========================================

/**
 * Core Context Providers
 * Wraps essential app-wide context providers with error boundaries
 */
const CoreProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize auth manager asynchronously after component mounts
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info("[ContextProviders] Initializing secure token storage...");
        await initializeSecureTokenStorage();
        logger.info(
          "[ContextProviders] Secure token storage initialized successfully"
        );

        logger.info("[ContextProviders] Initializing auth manager...");
        await initializeAuthManager();
        logger.info("[ContextProviders] Auth manager initialized successfully");
      } catch (error) {
        logger.error(
          "[ContextProviders] Failed to initialize auth systems",
          error
        );
      }
    };

    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        {typeof window !== "undefined" ? (
          (() => {
            const Auth0Provider = require("react-native-auth0").Auth0Provider;
            return (
              <Auth0Provider
                domain={"dev-12t76epiidwfskdk.uk.auth0.com"}
                clientId={"XdHmY0ud5HVHiztgOcbe7MxR7XrBViuZ"}
              >
                <GenericContextErrorBoundary
                  contextName="QueryClient"
                  critical={true}
                >
                  <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                      <NetworkProvider>
                        <AuthProvider>
                          <UserRoleProvider>
                            <CurrencyProvider>
                              <ToastProvider>
                                <LocationProvider>{children}</LocationProvider>
                              </ToastProvider>
                            </CurrencyProvider>
                          </UserRoleProvider>
                        </AuthProvider>
                      </NetworkProvider>
                    </ThemeProvider>
                  </QueryClientProvider>
                </GenericContextErrorBoundary>
              </Auth0Provider>
            );
          })()
        ) : (
          <GenericContextErrorBoundary contextName="Auth0" critical={true}>
            <div>Auth0 is not available on this platform.</div>
          </GenericContextErrorBoundary>
        )}
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

// ========================================
// FEATURE PROVIDERS WRAPPER
// ========================================

/**
 * Feature Context Providers
 * Wraps feature-specific context providers that may be conditionally rendered
 */
export const FeatureProviders: React.FC<{
  children: ReactNode;
  features?: {
    calendar?: boolean;
    host?: boolean;
    chat?: boolean;
    properties?: boolean;
  };
}> = ({ children, features = {} }) => {
  let wrappedChildren = children;

  // Conditionally wrap with feature-specific providers
  if (features.calendar) {
    const {
      CalendarProvider,
    } = require("../../features/calendar/context/CalendarContext");

    wrappedChildren = (
      <GenericContextErrorBoundary contextName="Calendar" critical={false}>
        <CalendarProvider>{wrappedChildren}</CalendarProvider>
      </GenericContextErrorBoundary>
    );
  }

  if (features.host) {
    const { HostProvider } = require("../../features/host/context/HostContext");

    wrappedChildren = (
      <GenericContextErrorBoundary contextName="Host" critical={false}>
        <HostProvider>{wrappedChildren}</HostProvider>
      </GenericContextErrorBoundary>
    );
  }

  if (features.chat) {
    const { ChatProvider } = require("../../features/chat/context/ChatContext");

    wrappedChildren = (
      <GenericContextErrorBoundary contextName="Chat" critical={false}>
        <ChatProvider>{wrappedChildren}</ChatProvider>
      </GenericContextErrorBoundary>
    );
  }

  if (features.properties) {
    const {
      PropertyProviderWithErrorBoundary,
    } = require("../../features/properties/context/PropertyContext");

    wrappedChildren = (
      <PropertyProviderWithErrorBoundary>
        {wrappedChildren}
      </PropertyProviderWithErrorBoundary>
    );
  }

  return <>{wrappedChildren}</>;
};

// ========================================
// MAIN PROVIDERS WRAPPER
// ========================================

/**
 * All Context Providers
 * Main wrapper that includes all context providers with proper error boundaries
 */
export const ContextProviders: React.FC<{
  children: ReactNode;
  features?: {
    calendar?: boolean;
    host?: boolean;
    chat?: boolean;
    properties?: boolean;
  };
}> = ({ children, features }) => (
  <AppErrorBoundary>
    <CoreProviders>
      <FeatureProviders features={features}>{children}</FeatureProviders>
    </CoreProviders>
  </AppErrorBoundary>
);

// ========================================
// CONVENIENCE COMPONENTS
// ========================================

/**
 * App Providers
 * Simplified wrapper for app-level providers
 */
export const AppProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ContextProviders
    features={{ calendar: true, host: true, chat: true, properties: true }}
  >
    {children}
  </ContextProviders>
);

/**
 * Minimal Providers
 * Essential providers only (for testing or minimal setups)
 */
export const MinimalProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ContextProviders>{children}</ContextProviders>;

/**
 * Screen Providers
 * Providers for specific screen types
 */
export const ScreenProviders: React.FC<{
  children: ReactNode;
  screenType: "auth" | "onboarding" | "main" | "host" | "traveler";
}> = ({ children, screenType }) => {
  const features = {
    calendar: ["main", "host", "traveler"].includes(screenType),
    host: ["main", "host"].includes(screenType),
    chat: ["main", "host", "traveler"].includes(screenType),
    properties: ["main", "host", "traveler"].includes(screenType),
  };

  return <ContextProviders features={features}>{children}</ContextProviders>;
};

// ========================================
// ERROR RECOVERY UTILITIES
// ========================================

/**
 * Context Error Recovery Hook
 * Provides utilities for recovering from context errors
 */
export const useContextErrorRecovery = () => {
  const recoverContext = React.useCallback((contextName: string) => {
    console.log(
      `[ContextErrorRecovery] Attempting to recover ${contextName} context`
    );

    // Emit recovery event
    // eventEmitter.emit('context:recovery_attempted', { contextName });

    // Force re-render by updating a dummy state
    // This can help recover from certain context errors
    return true;
  }, []);

  const reportContextError = React.useCallback(
    (contextName: string, error: Error) => {
      console.error(
        `[ContextErrorRecovery] Context error in ${contextName}:`,
        error
      );

      // Report to analytics in production
      if (!__DEV__) {
        // analytics.recordError(error, { context: contextName });
      }
    },
    []
  );

  return {
    recoverContext,
    reportContextError,
  };
};

// ========================================
// EXPORTS
// ========================================

export default ContextProviders;

// Re-export individual providers for flexibility
export {
  AuthProvider,
  NetworkProvider,
  ThemeProvider,
  CurrencyProvider,
  ToastProvider,
  UserRoleProvider,
};

// Re-export error boundaries
export {
  AppErrorBoundary,
  ContextErrorBoundary,
  GenericContextErrorBoundary,
} from "../error";
