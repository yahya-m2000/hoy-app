/**
 * LogoutHandler component
 * Handles global logout events and ensures proper app state reset
 */

import { useEffect } from "react";
import { router } from "expo-router";
import { eventEmitter, AppEvents } from "@shared/utils";
import { useAuth } from "@shared/context";

export const LogoutHandler = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleLogout = () => {
      console.log("🔄 Global logout event received - handling navigation...");

      try {
        // Navigate to home screen after logout
        if (router.canGoBack()) {
          // Clear the navigation stack by going to the root
          router.dismissAll();
        }

        // Replace with home screen to ensure clean navigation state
        router.replace("/(tabs)/traveler/home");

        console.log("✅ Navigation handled successfully after logout");
      } catch (error) {
        console.error("❌ Error handling logout navigation:", error);
        // Fallback navigation
        try {
          router.push("/(tabs)/traveler/home");
        } catch (fallbackError) {
          console.error("❌ Fallback navigation also failed:", fallbackError);
        }
      }
    };

    const handleLogoutComplete = () => {
      console.log("🔄 Logout complete event received");

      // Additional cleanup if needed
      try {
        // Force navigation to ensure we're on the right screen
        setTimeout(() => {
          if (!isAuthenticated) {
            router.replace("/(tabs)/traveler/home");
          }
        }, 100); // Small delay to ensure auth state is updated
      } catch (error) {
        console.error("❌ Error in logout complete handler:", error);
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
