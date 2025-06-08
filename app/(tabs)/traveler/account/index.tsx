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
import { useTheme, useAuth } from "@shared/context";

// Hooks
import { useCurrentUser } from "@shared/hooks";

// Utils
import { performLogout } from "@shared/utils";

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
  const { isAuthenticated } = useAuth();
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
        <StatusBar style={isDark ? "light" : "dark"} />{" "}
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
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />{" "}
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
        )}{" "}
        {/* Preferences Section */}
        <PreferencesSection isAuthenticated={isAuthenticated} />
        {/* Account Section */}
        <AccountSection
          isAuthenticated={isAuthenticated}
          onLogout={performLogout}
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
    marginTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
});
