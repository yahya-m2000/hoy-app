/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

// Expo and third-party libraries
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// App context and hooks
import { useTheme, useAuth } from "@shared/context";
import { useCurrentUser } from "@shared/hooks";

// Components
import { CategoryListingsCarousel } from "@modules/properties";
// Utils
import { userUtils } from "src/shared/utils";

// Constants

import { spacing, fontSize, radius, fontWeight } from "@shared/constants";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const router = useRouter();

  // Handle sign in button press
  const handleSignInPress = () => {
    router.push("/(overlays)/auth");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          paddingTop: insets.top + spacing.xl,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.greetingText,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {userUtils.getGreeting(isAuthenticated, user)}
          </Text>
          {!isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.signInButton,
                {
                  backgroundColor: theme.colors.primary[600],
                },
              ]}
              onPress={handleSignInPress}
            >
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Category Listings Carousel */}
        <CategoryListingsCarousel city="New York" />
        <CategoryListingsCarousel city="Savannah" />
        <CategoryListingsCarousel city="Brooklyn" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  greetingText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  signInButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  signInButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 30,
    paddingHorizontal: spacing.md,
    width: "100%",
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  searchButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    textAlign: "left",
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  categoriesContainer: {
    marginVertical: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  skeletonContainer: {
    marginBottom: spacing.md,
  },
  skeletonDetails: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  emptyStateContainer: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginVertical: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
