/**
 * CategoryListingsCarousel component
 * Displays a horizontal carousel of properties filtered by category and city
 * Picks a random category on launch and stays fixed to that category
 * Supports backend city filtering via the useProperties hook
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";

// Shared utilities and hooks
import {
  useTheme,
  useProperties,
  PropertyType,
  fontWeight,
  LoadingSkeleton,
  spacing,
  fontSize,
} from "src/shared";

// Component imports
import { PropertyCard } from "../Cards";

interface CategoryListingsCarouselProps {
  city: string;
  maxItems?: number;
}

// Categories we'll cycle through
const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "available", label: "Available" },
  { id: "topRated", label: "Top Rated" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];

export const CategoryListingsCarousel: React.FC<
  CategoryListingsCarouselProps
> = ({ city, maxItems = 6 }) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Pick a random category on component mount and keep it fixed
  const [currentCategoryIndex] = useState(() =>
    Math.floor(Math.random() * CATEGORIES.length)
  );

  const currentCategory = CATEGORIES[currentCategoryIndex]; // Fetch properties based on current category and city
  const getPropertiesQuery = useCallback(() => {
    const baseQuery = {
      city: city, // Backend now supports city filtering
    };

    switch (currentCategory.id) {
      case "popular":
        return {
          ...baseQuery,
          sort: { field: "rating" as const, order: "desc" as const },
        };
      case "available":
        return {
          ...baseQuery,
          sort: { field: "createdAt" as const, order: "desc" as const },
        };
      case "topRated":
        return {
          ...baseQuery,
          sort: { field: "rating" as const, order: "desc" as const },
        };
      case "new":
        return {
          ...baseQuery,
          sort: { field: "createdAt" as const, order: "desc" as const },
        };
      case "featured":
        return {
          ...baseQuery,
          sort: { field: "rating" as const, order: "desc" as const },
        };
      default:
        return baseQuery;
    }
  }, [currentCategory.id, city]);
  const { properties, loading } = useProperties(getPropertiesQuery());

  // Limit the number of properties displayed in the carousel
  const filteredProperties = properties.slice(0, maxItems);

  // Handle property press
  const handlePropertyPress = (property: PropertyType) => {
    router.push({
      pathname: "/(tabs)/traveler/home/[id]",
      params: {
        property: JSON.stringify(property),
        returnTo: "/(tabs)/traveler/home",
      },
    });
  };
  // Render a property card in small variant
  const renderProperty = ({ item }: { item: PropertyType }) => (
    <View style={styles.propertyCardContainer}>
      <PropertyCard
        _id={item._id}
        name={item.name}
        title={item.title}
        address={item.address}
        price={typeof item.price === "object" ? item.price.amount : item.price}
        currency={item.currency}
        imageUrl={item.images?.[0]}
        images={item.images}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handlePropertyPress(item)}
        variant="small"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerText,
            { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
          ]}
        >
          <Text
            style={[styles.categoryText, { color: theme.colors.primary[600] }]}
          >
            {currentCategory.label}
          </Text>{" "}
          in <Text style={{ fontWeight: fontWeight.medium }}>{city}</Text>
        </Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          {" "}
          <FlatList
            data={[1, 2, 3, 4]} // Skeleton placeholders
            renderItem={() => (
              <View style={styles.skeletonCardContainer}>
                <LoadingSkeleton style={styles.skeletonCard} />
                <View style={{ padding: spacing.sm }}>
                  <LoadingSkeleton
                    height={12}
                    width="70%"
                    borderRadius={4}
                    style={{ marginBottom: 8 }}
                  />
                  <LoadingSkeleton height={10} width="50%" borderRadius={4} />
                </View>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={200 + spacing.xs * 2}
          />
        </View>
      ) : filteredProperties.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[500] },
          ]}
        >
          No {currentCategory.label.toLowerCase()} properties available right
          now
        </Text>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderProperty}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={200 + spacing.xs * 2}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    marginVertical: spacing.md,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.md,
  },
  categoryText: {
    fontWeight: fontWeight.bold,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  seeAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  propertyCardContainer: {
    paddingHorizontal: spacing.md,

    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    height: 220,
  },
  skeletonCardContainer: {
    width: 200, // Fixed width to match the square PropertyCard small variant
    height: 200, // Fixed height to match the square PropertyCard small variant
    marginHorizontal: spacing.xs,
  },
  skeletonCard: {
    height: 120, // Image portion height to match PropertyCard small variant
    borderRadius: 12,
  },
  emptyText: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xl,
    textAlign: "center",
    fontStyle: "italic",
    fontSize: fontSize.sm,
  },
});

export default CategoryListingsCarousel;
