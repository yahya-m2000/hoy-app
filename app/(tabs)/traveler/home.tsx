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
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// App context and hooks
import { useTheme } from "@common-context/ThemeContext";
import {
  useFeaturedProperties,
  useProperties,
} from "@common-hooks/useProperties";

// Components
import PropertyCard from "@common-components/PropertyCard";
import LoadingSkeleton from "@common-components/LoadingSkeleton";

// Types
import { PropertyType } from "@common/types/property";

// Constants
import { fontSize, fontWeight } from "@constants/typography";
import { spacing } from "@constants/spacing";
import { radius } from "@constants/radius";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { properties: featured, loading: loadingFeatured } =
    useFeaturedProperties();
  const { properties: topRated, loading: loadingTop } = useProperties({
    sort: { field: "rating", order: "desc" }, // Sort by rating in descending order to get top-rated properties
  });
  const router = useRouter();
  // Handle property card press - navigate to property details
  const handlePropertyPress = (property: PropertyType) => {
    // Navigate to property modal with property data
    router.push({
      pathname: "/(screens)/traveler/property-details",
      params: {
        property: JSON.stringify(property),
      },
    });
  };

  // Render a category item
  // const renderCategory = ({ item }: { item: string }) => (
  //   <View
  //     style={[
  //       styles.categoryItem,
  //       {
  //         backgroundColor: isDark
  //           ? theme.colors.gray[800]
  //           : theme.colors.gray[100],
  //         borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
  //       },
  //     ]}
  //   >
  //     <Text
  //       style={[
  //         styles.categoryText,
  //         { color: isDark ? theme.colors.gray[300] : theme.colors.gray[600] },
  //       ]}
  //     >
  //       {item}
  //     </Text>
  //   </View>
  // );

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

      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {t("home.title")}
          </Text>

          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[200],
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/traveler/search")}
          >
            <Ionicons
              name="search"
              size={18}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              style={styles.searchIcon}
            />
            <Text
              style={[
                styles.searchButtonText,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("home.searchPlaceholder") || "Make your search"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Featured Properties */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {t("home.popularTitle")}
          </Text>
          {/* <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            {t("common.seeAll")}
          </Text> */}
        </View>

        {loadingFeatured ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton height={220} width="100%" borderRadius={8} />
            <View style={styles.skeletonDetails}>
              <LoadingSkeleton height={20} width="70%" borderRadius={4} />
              <LoadingSkeleton
                height={16}
                width="50%"
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
              <LoadingSkeleton
                height={16}
                width="40%"
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        ) : featured.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("home.noFeaturedProperties")}
            </Text>
          </View>
        ) : (
          featured.map((property, i) => {
            if (!property || !property._id) {
              return null;
            }

            return (
              <PropertyCard
                key={i}
                {...property}
                city={property.city}
                address={property.address || property.location}
                style={styles.propertyCard}
                onPress={() => handlePropertyPress(property)}
              />
            );
          })
        )}

        {/* Top Rated Properties */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {t("home.topRated")}
          </Text>
          {/* <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            {t("common.seeAll")}
          </Text> */}
        </View>

        {loadingTop ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton height={220} width="100%" borderRadius={8} />
            <View style={styles.skeletonDetails}>
              <LoadingSkeleton height={20} width="70%" borderRadius={4} />
              <LoadingSkeleton
                height={16}
                width="50%"
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
              <LoadingSkeleton
                height={16}
                width="40%"
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        ) : (
          topRated.map((property, i) => (
            <PropertyCard
              key={i}
              {...property}
              city={property.city}
              address={property.address || property.location}
              style={styles.propertyCard}
              onPress={() => handlePropertyPress(property)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
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
    fontWeight: String(fontWeight.semibold) as any,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
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
    fontSize: fontSize.md,
    fontWeight: String(fontWeight.semibold) as any,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.medium) as any,
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

    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginVertical: spacing.md,
  },
});
