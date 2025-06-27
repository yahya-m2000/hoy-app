/**
 * Account screen for the Hoy application in traveler mode
 * Shows user profile and settings using modular components
 */

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, router } from "expo-router";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context
import { useAuth, useToast } from "@shared/context";

// Hooks
import { useTheme, useCurrentUser } from "@shared/hooks";

// Components
import { LoadingSkeleton } from "@shared/components";
import {
  UserProfileSection,
  SignInSection,
  PreferencesSection,
  AccountSection,
  SupportSection,
} from "@modules/account";

// Constants
import { spacing } from "@shared/constants";

export default function AccountScreen() {
  const { theme, isDark } = useTheme();
  const {
    isAuthenticated,
    logout: authLogout,
    checkAuthenticationState,
  } = useAuth();
  const { showToast } = useToast();
  const {
    data: currentUser,
    isLoading: userLoading,
    refetch,
  } = useCurrentUser();
  const [showDevOptions, setShowDevOptions] = useState(false);
  const insets = useSafeAreaInsets();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Check if dev mode was previously enabled
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        const storedCount = await AsyncStorage.getItem("devTapCount");
        const devTapCount = parseInt(storedCount || "0", 10) || 0;
        if (devTapCount >= 10) {
          setShowDevOptions(true);
        }
      } catch (error) {
        console.error("Error checking dev mode:", error);
      }
    };

    checkDevMode();
  }, []);

  // Use useFocusEffect for screen focus behavior
  useFocusEffect(
    React.useCallback(() => {
      console.log("Account screen focused - refreshing user data");
      refetch();
      setLastRefresh(Date.now());
    }, [refetch])
  );

  // Also refresh on initial mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Log user data when loaded
  useEffect(() => {
    if (currentUser) {
      console.log(`User data loaded: ${currentUser.email} (${currentUser.id})`);
    }
  }, [currentUser]);
  // Format joined date if available
  const joinedDate = currentUser?.joinedDate
    ? format(new Date(currentUser.joinedDate), "MMMM yyyy")
    : "";

  // Handle edit profile navigation
  const handleEditProfile = () => {
    router.navigate("/(overlays)/account/personal-info");
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    setLastRefresh(Date.now());
  }; // Handle logout with proper navigation
  const handleLogout = async () => {
    try {
      console.log("🔓 Starting logout process from account screen...");

      // Use AuthContext logout method to ensure state is properly updated
      await authLogout();

      // Force a re-check of authentication state
      await checkAuthenticationState();

      // Clear any cached user data
      refetch();

      // Show success toast
      showToast({
        type: "success",
        message: "Signed out successfully",
      });

      // Small delay to ensure state propagates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to home screen after logout
      console.log("🔄 Navigating to home screen after logout...");
      router.replace("/(tabs)/traveler/home");

      console.log("✅ Logout and navigation completed successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);

      // Force authentication state to false even if logout fails
      await checkAuthenticationState();
      refetch();

      // Show error toast
      showToast({
        type: "error",
        message: "Sign out failed. Please try again.",
      });

      // Even if logout fails, try to navigate away
      router.replace("/(tabs)/traveler/home");
    }
  };

  const isLoading = userLoading;
  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
          },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LoadingSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Conditional Profile/Sign-In Section */}
        {isAuthenticated ? (
          <UserProfileSection
            currentUser={currentUser || null}
            joinedDate={joinedDate}
            userLoading={userLoading}
            onEditProfile={handleEditProfile}
          />
        ) : (
          <SignInSection />
        )}
        {/* Preferences Section */}
        <PreferencesSection isAuthenticated={isAuthenticated} />
        {/* Account Section */}
        <AccountSection
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        {/* Support Section */}
        <SupportSection
          showDevOptions={showDevOptions}
          lastRefresh={lastRefresh}
          onRefresh={handleRefresh}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
});
