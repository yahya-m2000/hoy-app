/**
 * HorizontalListingsCarousel component
 * Displays a horizontal carousel of properties filtered by category and city
 * Picks a random category on launch and stays fixed to that category
 * Supports backend city filtering via the useProperties hook
 */

// React and React Native
import React, { useState, useCallback } from "react";
import { FlatList } from "react-native";
import { Container, Text } from "@shared/components/base";

// Third-party libraries
import { useRouter } from "expo-router";

// Shared utilities and hooks
import {
  useTheme,
  useProperties,
  PropertyType,
  PropertyCardSkeleton,
} from "src/shared";

// Local components
import { PropertyCard } from "../../cards/property-card";

// Types
interface HorizontalListingsCarouselProps {
  city: string;
  maxItems?: number;
}

// Constants
const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "available", label: "Available" },
  { id: "topRated", label: "Top Rated" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];

// Main Component
export const HorizontalListingsCarousel: React.FC<
  HorizontalListingsCarouselProps
> = ({ city, maxItems = 6 }) => {
  // Hooks
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // State - Pick a random category on component mount and keep it fixed
  const [currentCategoryIndex] = useState(() =>
    Math.floor(Math.random() * CATEGORIES.length)
  );

  // Computed values
  const currentCategory = CATEGORIES[currentCategoryIndex];

  // Query builder for properties based on category and city
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

  // Data fetching
  const { properties, loading } = useProperties(getPropertiesQuery());

  // Data processing
  const filteredProperties = properties.slice(0, maxItems);

  // Event handlers
  const handlePropertyPress = (property: PropertyType) => {
    router.push({
      pathname: "/(tabs)/traveler/home/property/[id]",
      params: {
        property: JSON.stringify(property),
        returnTo: "/(tabs)/traveler/home",
      },
    });
  };

  // Render functions
  const renderProperty = ({ item }: { item: PropertyType }) => (
    <Container paddingHorizontal="md">
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
        propertyType={item.propertyType}
        onPress={() => handlePropertyPress(item)}
        variant="large"
        animateOnMount={true}
        fadeInDuration={600}
      />
    </Container>
  );
  const renderSkeletonItem = () => (
    <Container paddingHorizontal="md">
      {/* <PropertyCardSkeleton variant="medium" fadeAnimation={true} /> */}
    </Container>
  );

  // Render loading state
  const renderLoadingState = () => (
    <Container height={220}>
      <FlatList
        data={[1, 2, 3, 4]} // Skeleton placeholders
        renderItem={renderSkeletonItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={216} // Adjusted for spacing
      />
    </Container>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Text
      color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
      variant="body"
    >
      No {currentCategory.label.toLowerCase()} properties available right now
    </Text>
  );

  // Render properties list
  const renderPropertiesList = () => (
    <FlatList
      data={filteredProperties}
      renderItem={renderProperty}
      keyExtractor={(item) => item._id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 8 }}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={216} // Adjusted for spacing
      initialNumToRender={3}
      maxToRenderPerBatch={4}
      windowSize={5}
    />
  );
  // Main render
  return (
    <Container backgroundColor="transparent" marginVertical="md">
      {/* Header */}
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="md"
        marginHorizontal="md"
      >
        <Text variant="h6" weight="normal">
          <Text variant="h6" weight="normal">
            {currentCategory.label}
          </Text>
          <Text> in </Text>
          <Text variant="h6" weight="bold">
            {city}
          </Text>
        </Text>
      </Container>

      {/* Content */}
      {loading
        ? renderLoadingState()
        : filteredProperties.length === 0
        ? renderEmptyState()
        : renderPropertiesList()}
    </Container>
  );
};

export default HorizontalListingsCarousel;
