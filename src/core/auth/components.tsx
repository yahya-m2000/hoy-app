/**
 * Authentication Components
 *
 * Core authentication UI components including:
 * - Logout handler for global events
 * - Auth state indicators
 * - Authentication guards
 *
 * @module @core/auth/components
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useEffect } from "react";
import { router } from "expo-router";
import { eventEmitter, AppEvents } from "@core/utils";
import { useAuth } from "../context/AuthContext";
import { logger } from "../utils/sys/log";

// ========================================
// LOGOUT HANDLER COMPONENT
// ========================================

/**
 * LogoutHandler component
 * Handles global logout events and ensures proper app state reset
 */
export const LogoutHandler = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleLogout = () => {
      logger.log("🔄 Global logout event received - handling navigation...");

      try {
        // Navigate to home screen after logout
        if (router.canGoBack()) {
          // Clear the navigation stack by going to the root
          router.dismissAll();
        }

        // Replace with home screen to ensure clean navigation state
        router.replace("/(tabs)/traveler/home");

        logger.log("✅ Navigation handled successfully after logout");
      } catch (error) {
        logger.error("❌ Error handling logout navigation:", error);
        // Fallback navigation
        try {
          router.push("/(tabs)/traveler/home");
        } catch (fallbackError) {
          logger.error("❌ Fallback navigation also failed:", fallbackError);
        }
      }
    };

    const handleLogoutComplete = () => {
      logger.log("🔄 Logout complete event received");

      // Additional cleanup if needed
      try {
        // Force navigation to ensure we're on the right screen
        setTimeout(() => {
          if (!isAuthenticated) {
            router.replace("/(tabs)/traveler/home");
          }
        }, 100); // Small delay to ensure auth state is updated
      } catch (error) {
        logger.error("❌ Error in logout complete handler:", error);
      }
    };

    // Subscribe to logout events
    const unsubscribeLogout = eventEmitter.on(
      AppEvents.AUTH_LOGOUT,
      handleLogout
    );
    const unsubscribeLogoutComplete = eventEmitter.on(
      AppEvents.AUTH_LOGOUT_COMPLETE,
      handleLogoutComplete
    );

    return () => {
      // Cleanup event listeners
      unsubscribeLogout();
      unsubscribeLogoutComplete();
    };
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

// ========================================
// AUTH GUARD COMPONENT
// ========================================

/**
 * AuthGuard component
 * Wraps components that require authentication
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  redirectTo = "/(auth)/login",
}) => {
  const { isAuthenticated, isAuthChecked } = useAuth();

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isAuthChecked, redirectTo]);

  // Show loading while checking auth
  if (!isAuthChecked) {
    return fallback;
  }

  // Show children if authenticated, fallback if not
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// ========================================
// GUEST GUARD COMPONENT
// ========================================

/**
 * GuestGuard component
 * Wraps components that should only be shown to non-authenticated users
 */
export interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = "/(tabs)/traveler/home",
}) => {
  const { isAuthenticated, isAuthChecked } = useAuth();

  useEffect(() => {
    if (isAuthChecked && isAuthenticated && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isAuthChecked, redirectTo]);

  // Show loading while checking auth
  if (!isAuthChecked) {
    return null;
  }

  // Show children only if not authenticated
  return !isAuthenticated ? <>{children}</> : null;
};
