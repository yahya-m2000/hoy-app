/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import { spacing } from "../../../src/constants/spacing";
import { radius } from "../../../src/constants/radius";
import PropertyCard from "../../../src/components/PropertyCard";
import {
  useFeaturedProperties,
  useProperties,
} from "../../../src/hooks/useProperties";
import { PropertyType } from "../../../src/types/property";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDateSelection } from "../../../src/context/DateSelectionContext";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const {
    properties: featured,
    loading: loadingFeatured,
    // error: featuredError,
    // fetchProperties: fetchFeatured,
  } = useFeaturedProperties();
  const {
    properties: topRated,
    loading: loadingTop,
    // error: topRatedError,
    // fetchProperties: fetchTopRated,
  } = useProperties({
    sort: { field: "rating", order: "desc" }, // Sort by rating in descending order to get top-rated properties
  });
  const router = useRouter();
  const { propertyDates } = useDateSelection();

  // Log featured properties once loaded
  React.useEffect(() => {
    if (!loadingFeatured && featured.length > 0) {
      console.log("Featured properties loaded:", featured.length);
      console.log(
        "First featured property:",
        featured[0].title,
        featured[0].images?.length || 0,
        "images"
      );
    }
  }, [featured, loadingFeatured]);

  // Handle property card press - navigate to property details
  const handlePropertyPress = (property: PropertyType) => {
    // Get optimal dates that were pre-fetched when card was rendered
    const savedDates = propertyDates.get(property._id)?.selectedDates;

    // Navigate to property modal with property data and dates
    router.push({
      pathname: "/(screens)/PropertyModalScreen",
      params: {
        property: JSON.stringify(property),
        startDate: savedDates?.startDate
          ? savedDates.startDate.toISOString()
          : undefined,
        endDate: savedDates?.endDate
          ? savedDates.endDate.toISOString()
          : undefined,
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
            onPress={() => router.push("/(tabs)/search")}
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
        {/* Categories (empty in original) */}
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
            {t("home.featuredTitle")}
          </Text>
          <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>
            {t("common.seeAll")}
          </Text>
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
            </View>{" "}
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
              console.error("Invalid property object at index", i, property);
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
          <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>
            {t("common.seeAll")}
          </Text>
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
    paddingBottom: spacing.xs,
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
    fontSize: fontSize.lg,
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
