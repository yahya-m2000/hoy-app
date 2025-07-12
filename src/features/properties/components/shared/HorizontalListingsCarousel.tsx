/**
 * HorizontalListingsCarousel component
 * Displays a horizontal carousel of properties filtered by category and city
 * Picks a random category on launch and stays fixed to that category
 * Supports backend city filtering via the useProperties hook
 */

// React and React Native
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { FlatList, Dimensions } from "react-native";
import { Container, PropertyCardSkeleton, Text } from "@shared/components";

// Third-party libraries
import { useRouter } from "expo-router";
import { Skeleton } from "@rneui/base/dist";
import { useTranslation } from "react-i18next";

// Shared utilities and hooks
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";

// Local components
import { PropertyCard } from "../cards/PropertyCard";
import { useProperties } from "@features/properties/hooks/useProperties";
import { PropertyType } from "@core/types";

// Types
interface HorizontalListingsCarouselProps {
  city: string;
  maxItems?: number;
  onStatusChange?: (status: "loading" | "success" | "error") => void;
  disableAnimations?: boolean;
}

// Main Component
export const HorizontalListingsCarousel: React.FC<
  HorizontalListingsCarouselProps
> = ({ city, maxItems = 6, onStatusChange, disableAnimations = false }) => {
  // Hooks
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const cardMargin = spacing.md;
  const containerPadding = spacing.md * 2; // padding on both sides
  const cardWidth = (screenWidth - containerPadding - cardMargin) / 2; // Same calculation as wishlist
  const snapToInterval = cardWidth + cardMargin; // card width + margin for smooth snapping

  // Categories - moved inside component to be reactive to language changes
  const CATEGORIES = useMemo(
    () => [
      { id: "popular", label: t("home.categories.popular") },
      { id: "available", label: t("home.categories.available") },
      { id: "topRated", label: t("home.categories.topRated") },
      { id: "new", label: t("home.categories.new") },
      { id: "featured", label: t("home.categories.featured") },
    ],
    [t]
  );

  // State - Pick a random category on component mount and keep it fixed
  const [currentCategoryIndex] = useState(() =>
    Math.floor(Math.random() * CATEGORIES.length)
  );

  // Retry and loading state
  const [retryCount, setRetryCount] = useState(0);
  const [minLoadingElapsed, setMinLoadingElapsed] = useState(false);
  const maxRetries = 3;
  const retryDelay = 2000; // ms
  const minLoadingTime = 1500; // ms
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const { properties, loading, error, fetchProperties } = useProperties(
    getPropertiesQuery()
  );

  // Data processing
  const filteredProperties = properties.slice(0, maxItems);

  // Retry and minimum loading logic
  useEffect(() => {
    // Start minimum loading timer on mount
    setMinLoadingElapsed(false);
    if (minLoadingTimeoutRef.current)
      clearTimeout(minLoadingTimeoutRef.current);
    minLoadingTimeoutRef.current = setTimeout(() => {
      setMinLoadingElapsed(true);
    }, minLoadingTime);
    return () => {
      if (minLoadingTimeoutRef.current)
        clearTimeout(minLoadingTimeoutRef.current);
    };
  }, [city, currentCategoryIndex]);

  useEffect(() => {
    // If not loading, no properties, and not max retries, retry after delay
    if (
      !loading &&
      filteredProperties.length === 0 &&
      retryCount < maxRetries
    ) {
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount((c) => c + 1);
        fetchProperties();
      }, retryDelay);
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [loading, filteredProperties.length, retryCount, fetchProperties]);

  // Reset retry count if city/category changes
  useEffect(() => {
    setRetryCount(0);
  }, [city, currentCategoryIndex]);

  // Notify parent of loading state
  useEffect(() => {
    if (onStatusChange) {
      if (
        loading ||
        !minLoadingElapsed ||
        (filteredProperties.length === 0 && retryCount < maxRetries)
      ) {
        onStatusChange("loading");
      } else if (filteredProperties.length > 0) {
        onStatusChange("success");
      } else if (
        !loading &&
        minLoadingElapsed &&
        filteredProperties.length === 0 &&
        retryCount >= maxRetries
      ) {
        onStatusChange("error");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, minLoadingElapsed, filteredProperties.length, retryCount]);

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
    <Container
      style={{
        width: cardWidth,
        marginRight: spacing.md,
      }}
    >
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
        variant="collection"
        animateOnMount={!disableAnimations}
        fadeInDuration={600}
      />
    </Container>
  );

  const renderSkeletonItem = () => (
    <Container
      style={{
        width: cardWidth,
        marginRight: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <PropertyCardSkeleton variant="large" />
    </Container>
  );

  // Render loading state
  const renderLoadingState = () => (
    <Container>
      <FlatList
        data={[1, 2, 3, 4]} // Skeleton placeholders
        renderItem={renderSkeletonItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={snapToInterval}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
      />
    </Container>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Container paddingHorizontal="md">
      <Text
        color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        variant="body"
      >
        {t("home.noPropertiesInCategory")}
      </Text>
    </Container>
  );

  // Render header
  const renderHeader = () => {
    if (
      loading ||
      !minLoadingElapsed ||
      (filteredProperties.length === 0 && retryCount < maxRetries)
    ) {
      // Skeleton header
      return (
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="md"
          marginHorizontal="md"
        >
          <Skeleton
            height={28}
            width={120}
            style={{ borderRadius: 8, backgroundColor: theme.colors.gray[100] }}
            skeletonStyle={{ backgroundColor: theme.skeleton }}
          />
          <Skeleton
            height={28}
            width={80}
            style={{ borderRadius: 8, backgroundColor: theme.colors.gray[100] }}
            skeletonStyle={{ backgroundColor: theme.skeleton }}
          />
        </Container>
      );
    }
    // Real header
    return (
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="md"
        marginHorizontal="md"
      >
        {/* Title */}
        <Text variant="h6" weight="medium">
          {currentCategory.label} {t("home.in")} {city}
        </Text>
      </Container>
    );
  };

  // Render properties list
  const renderPropertiesList = () => (
    <>
      {renderHeader()}
      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={snapToInterval}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
      />
    </>
  );

  // Main render
  return (
    <Container backgroundColor="transparent" marginVertical="md">
      {/* Content */}
      {loading ||
      !minLoadingElapsed ||
      (filteredProperties.length === 0 && retryCount < maxRetries) ? (
        <>
          {renderHeader()}
          {renderLoadingState()}
        </>
      ) : filteredProperties.length === 0 ? (
        renderEmptyState()
      ) : (
        renderPropertiesList()
      )}
    </Container>
  );
};

export default HorizontalListingsCarousel;
