/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";

// Expo and third-party libraries
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// App context and hooks
import { useTheme } from "@shared/hooks/useTheme";
import { useAuth } from "@shared/context";
import { useCurrentUser } from "@shared/hooks";

// Base components
import { Container } from "@shared/components/base/Container";
import { Text } from "@shared/components/base/Text";

// Module components
import { HorizontalListingsCarousel } from "@modules/properties";

// Utils
import { userUtils } from "@shared/utils";

// Constants
import { spacing, radius } from "@shared/constants";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const router = useRouter();

  // Handle sign in button press
  const handleSignInPress = () => {
    router.push("/(overlays)/common/auth");
  };
  return (
    <Container
      flex={1}
      backgroundColor={isDark ? theme.colors.gray[900] : theme.colors.gray[50]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Logo Section */}
        <Container alignItems="center" marginTop="md">
          <Image
            source={require("../../../../assets/image.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Container>

        {/* Header Section */}
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="md"
          paddingVertical="md"
          marginBottom="lg"
        >
          <Container flexDirection="row" alignItems="center">
            <Text variant="h6" weight="normal">
              Hi,&nbsp;
            </Text>
            <Text variant="h6" weight="bold" color={theme.text.primary}>
              {userUtils.getGreeting(isAuthenticated, user)}
            </Text>
          </Container>

          {!isAuthenticated && (
            <TouchableOpacity onPress={handleSignInPress}>
              <Text variant="h6" weight="bold">
                Sign in
              </Text>
            </TouchableOpacity>
          )}
        </Container>

        {/* Content Section */}
        <Container>
          <HorizontalListingsCarousel city="New York" />
          <HorizontalListingsCarousel city="Savannah" />
          <HorizontalListingsCarousel city="Brooklyn" />
        </Container>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  // Content
  content: {
    paddingBottom: spacing.xxl,
  },

  // Logo
  logo: {
    width: 120,
    height: 30,
  },

  // Sign in button
  signInButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
});
