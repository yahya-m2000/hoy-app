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
import { PropertyType } from "@core/types";

// Types
interface HorizontalListingsCarouselProps {
  city: string;
  properties: PropertyType[];
  loading: boolean;
  error: string | null;
  maxItems?: number;
  onStatusChange?: (status: "loading" | "success" | "error") => void;
  disableAnimations?: boolean;
}

// Main Component
export const HorizontalListingsCarousel: React.FC<
  HorizontalListingsCarouselProps
> = ({
  city,
  properties,
  loading,
  error,
  maxItems = 6,
  onStatusChange,
  disableAnimations = false,
}) => {
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
      { id: "popular", label: t("features.home.content.categories.popular") },
      {
        id: "available",
        label: t("features.home.content.categories.available"),
      },
      { id: "topRated", label: t("features.home.content.categories.topRated") },
      { id: "new", label: t("features.home.content.categories.new") },
      { id: "featured", label: t("features.home.content.categories.featured") },
    ],
    [t]
  );

  // State - Pick a random category on component mount and keep it fixed
  const [currentCategoryIndex] = useState(() =>
    Math.floor(Math.random() * CATEGORIES.length)
  );

  // Notify parent of loading state (only when status changes)
  const prevStatus = useRef<string | null>(null);
  useEffect(() => {
    let status: "loading" | "error" | "success";
    if (loading) status = "loading";
    else if (error) status = "error";
    else status = "success";
    if (onStatusChange && prevStatus.current !== status) {
      onStatusChange(status);
      prevStatus.current = status;
    }
  }, [loading, error, onStatusChange]);

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
      <PropertyCardSkeleton variant="collection" />
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
        {t("features.home.content.noPropertiesInCategory")}
      </Text>
    </Container>
  );

  // Render error state
  const renderErrorState = () => (
    <Container paddingHorizontal="md">
      <Text color={theme.colors.error} variant="body">
        {error}
      </Text>
    </Container>
  );

  // Render header
  const renderHeader = () => {
    // Real header
    return (
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="md"
        marginHorizontal="md"
        marginTop="sm"
        paddingVertical="xs"
      >
        {/* Title */}
        <Text variant="h6" weight="medium" numberOfLines={1} ellipsizeMode="tail">
          {CATEGORIES[currentCategoryIndex].label}{" "}
          {t("features.home.content.location.in")} {city}
        </Text>
      </Container>
    );
  };

  // Render properties list
  const renderPropertiesList = () => (
    <>
      {renderHeader()}
      <FlatList
        data={properties.slice(0, maxItems)}
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
    <Container backgroundColor="transparent" marginVertical="md" style={{ minHeight: 280 }}>
      {/* Content */}
      {loading ? (
        <>
          {renderHeader()}
          {renderLoadingState()}
        </>
      ) : error ? (
        renderErrorState()
      ) : !properties || properties.length === 0 ? (
        renderEmptyState()
      ) : (
        renderPropertiesList()
      )}
    </Container>
  );
};

export default HorizontalListingsCarousel;
