/**
 * Account screen for the Hoy application
 * Shows user profile and settings using modular components
 * Role-aware: Adapts content based on host/traveler mode
 */

import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

// Context
import { useAuth, useToast, useUserRole } from "@core/context";

// Hooks
import { useTheme } from "@core/hooks";
import { useCurrentUser } from "@features/user/hooks";

// Components
import { LoadingSkeleton, Container, Header, Text } from "@shared/components";

// Account Components - Import consolidated components
import ProfileWidget from "../components/Sections/ProfileWidget";
import SignInSection from "../components/Sections/SignInSection";
import ProfileSection from "../components/Sections/ProfileSection";

import { t } from "i18next";

const AccountScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    isAuthenticated,
    logout: authLogout,
    checkAuthenticationState,
  } = useAuth();
  const { userRole } = useUserRole();
  const isHost = userRole === "host";
  const { showToast } = useToast();
  const {
    data: currentUser,
    isLoading: userLoading,
    refetch,
  } = useCurrentUser();

  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Log user data when loaded
  useEffect(() => {
    if (currentUser) {
      console.log(`User data loaded: ${currentUser.email} (${currentUser.id})`);
    }
  }, [currentUser]);

  // Handle QR code navigation - Navigate to QRCodeScreen
  const handleQRCodePress = () => {
    if (isHost) {
      router.push("/host/profile/qr-code");
    } else {
      router.push("/traveler/profile/qr-code");
    }
  };

  // Handle refresh - only if authenticated
  const handleRefresh = () => {
    if (!isAuthenticated) {
      console.log("User not authenticated - skipping refresh");
      return;
    }
    refetch();
    setLastRefresh(Date.now());
  };

  // Handle logout with proper navigation
  const handleLogout = async () => {
    try {
      console.log("Starting logout process from account screen...");

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
      const targetRoute = isHost
        ? "/(tabs)/host/today"
        : "/(tabs)/traveler/home";
      router.replace(targetRoute);

      console.log("Logout and navigation completed successfully");
    } catch (error) {
      console.error("Error during logout:", error);

      // Force authentication state to false even if logout fails
      await checkAuthenticationState();
      refetch();

      // Show error toast
      showToast({
        type: "error",
        message: "Sign out failed. Please try again.",
      });

      // Even if logout fails, try to navigate away
      const targetRoute = isHost
        ? "/(tabs)/host/today"
        : "/(tabs)/traveler/home";
      router.replace(targetRoute);
    }
  };

  const isLoading = userLoading;

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <Container flex={1} backgroundColor={isDark ? "gray900" : "gray50"}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <Container padding="md" paddingBottom="xxl">
          <LoadingSkeleton />
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header title={t("navigation.profile")} />
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100, // Extra padding at bottom for safe scrolling
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Conditional Profile/Sign-In Section */}
        {isAuthenticated ? (
          <ProfileWidget
            user={currentUser || null}
            loading={userLoading}
            isHost={isHost}
            onQRCodePress={handleQRCodePress}
          />
        ) : (
          <SignInSection />
        )}

        {/* Consolidated Profile Sections */}
        <ProfileSection
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          showDevOptions={__DEV__}
          lastRefresh={lastRefresh}
          onRefresh={handleRefresh}
        />
      </ScrollView>
    </Container>
  );
};

export default AccountScreen;
