/**
 * Search Results Screen
 * Displays properties based on search criteria with filtering and sorting options
 */

import React, { useEffect, useMemo } from "react";
import { FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";

// Core
import { useTheme } from "@core/hooks";
import { fontSize, fontWeight, spacing, iconSize, radius } from "@core/design";

// Features
import { PropertyImageContainer } from "@features/properties/components/details";
import {
  useProperties,
  type SearchParams,
} from "@features/properties/hooks/useProperties";
// Shared
import {
  Container,
  Text,
  Icon,
  ListScreen,
  LoadingSpinner,
  EmptyState,
} from "@shared/components";
import { useToast } from "@core/context";

// Types
import type { PropertyType } from "@core/types";

export default function SearchResultsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams();

  // Parse search parameters from URL
  const searchParams: SearchParams = useMemo(() => {
    const searchQuery: SearchParams = {};

    if (params.location && typeof params.location === "string") {
      searchQuery.location = params.location;
    }

    if (params.startDate && typeof params.startDate === "string") {
      searchQuery.startDate = params.startDate;
    }

    if (params.endDate && typeof params.endDate === "string") {
      searchQuery.endDate = params.endDate;
    }

    if (params.adults && typeof params.adults === "string") {
      const adults = parseInt(params.adults, 10);
      if (!isNaN(adults)) {
        searchQuery.guests =
          adults +
          (params.children ? parseInt(params.children as string, 10) || 0 : 0);
      }
    }

    if (params.rooms && typeof params.rooms === "string") {
      const rooms = parseInt(params.rooms, 10);
      if (!isNaN(rooms)) {
        searchQuery.rooms = rooms;
      }
    }

    // Include coordinates if available
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude as string);
      const lng = parseFloat(params.longitude as string);
      if (!isNaN(lat) && !isNaN(lng)) {
        searchQuery.coordinates = {
          latitude: lat,
          longitude: lng,
          radius: 50, // 50km radius
        };
      }
    }

    return searchQuery;
  }, [params]);

  // Use the properties hook for searching
  const { properties, loading, error, fetchProperties } =
    useProperties(searchParams);

  // Show error toast if search fails
  useEffect(() => {
    if (error && typeof error === "string" && error.trim() !== "") {
      showToast({
        message: error,
        type: "error",
        duration: 4000,
      });
    }
  }, [error, showToast]);

  // Handle property press
  const handlePropertyPress = (property: PropertyType) => {
    console.log("Navigating to property:", property._id);
    router.push({
      pathname: "/(tabs)/traveler/search/property/[id]",
      params: {
        property: JSON.stringify(property),
        returnTo: "/(tabs)/traveler/search/results",
      },
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProperties();
  };

  // Handle filters press
  const handleFiltersPress = () => {
    // Navigate to filters screen
    router.push({
      pathname: "/(overlays)/search/filters",
      params: {
        location: params.location,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
        returnTo: "/search/results",
      },
    });
  };

  // Render search summary
  const renderSearchSummary = () => {
    const locationText =
      (params.location as string) || t("search.anyLocation") || "Any location";
    const datesText =
      (params.displayDates as string) || t("search.anyDates") || "Any dates";
    const guestsText =
      (params.displayTravelers as string) ||
      t("search.anyGuests") ||
      "Any guests";

    return (
      <Container
        backgroundColor={theme.surface}
        paddingHorizontal="lg"
        paddingVertical="md"
        marginTop="sm"
        borderRadius="xl"
        marginBottom="md"
      >
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Container flex={1}>
            <Text
              variant="body"
              weight="semibold"
              color={theme.text.primary}
              numberOfLines={1}
              style={{ marginBottom: 4 }}
            >
              {locationText}
            </Text>
            <Container flexDirection="row" alignItems="center">
              <Text variant="caption" color={theme.text.secondary}>
                {datesText}
              </Text>
              <Text
                variant="caption"
                color={theme.text.secondary}
                style={{ marginHorizontal: 4 }}
              >
                •
              </Text>
              <Text variant="caption" color={theme.text.secondary}>
                {guestsText}
              </Text>
            </Container>
          </Container>

          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{
              top: spacing.sm,
              bottom: spacing.sm,
              left: spacing.sm,
              right: spacing.sm,
            }}
          >
            <Icon
              name="create-outline"
              size={iconSize.sm}
              color={theme.text.secondary}
            />
          </TouchableOpacity>
        </Container>
      </Container>
    );
  };

  // Render results count
  const renderResultsCount = () => {
    if (loading) return null;

    return (
      <Container paddingBottom="sm">
        <Text
          variant="h6"
          weight="semibold"
          color={theme.text.primary}
          style={{ marginBottom: 4 }}
        >
          {properties.length === 0
            ? t("search.noResults") || "No results found"
            : `${properties.length} ${
                properties.length === 1 ? "property" : "properties"
              } found`}
        </Text>
        {properties.length > 0 && (
          <Text variant="caption" color={theme.text.secondary}>
            {t("search.resultsFound") ||
              `${properties.length} properties found`}
          </Text>
        )}
      </Container>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      icon="search-outline"
      title={t("search.noPropertiesFound") || "No properties found"}
      message={
        t("search.tryAdjustingFilters") || "Try adjusting your search filters"
      }
      action={{
        label: t("search.newSearch") || "New Search",
        onPress: () => router.back(),
      }}
    />
  );

  // Simplified PropertyCard component for search results
  const PropertyCard: React.FC<{ property: PropertyType }> = ({ property }) => {
    const price =
      typeof property.price === "object"
        ? property.price.amount
        : property.price;
    const currency =
      typeof property.price === "object" ? property.price.currency : "USD";

    return (
      <Container paddingVertical="md">
        <Container flexDirection="row">
          {/* Property Image */}
          <Container width={80} height={80} marginRight="md">
            <PropertyImageContainer
              images={property.images}
              containerStyle={{
                borderRadius: radius.md,
                overflow: "hidden",
              }}
              imageStyle={{
                borderRadius: radius.md,
              }}
              variant="small"
            />
          </Container>

          {/* Property Content */}
          <Container flex={1} justifyContent="space-between">
            <Text
              variant="body"
              weight="semibold"
              color={theme.text.primary}
              numberOfLines={2}
              style={{ lineHeight: fontSize.md * 1.2 }}
            >
              {property.name || property.title}
            </Text>

            <Text
              variant="caption"
              color={theme.text.secondary}
              numberOfLines={1}
              style={{ textTransform: "capitalize" }}
            >
              {property.type || "Property"}
            </Text>

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop="xs"
            >
              <Container flexDirection="row" alignItems="center">
                {property.rating && property.rating > 0 && (
                  <>
                    <Icon
                      name="star"
                      size={14}
                      color={theme.colors.primary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      variant="caption"
                      weight="medium"
                      color={theme.text.primary}
                      style={{ marginRight: 4 }}
                    >
                      {property.rating.toFixed(1)}
                    </Text>
                    {property.reviewCount && property.reviewCount > 0 && (
                      <Text variant="caption" color={theme.text.tertiary}>
                        ({property.reviewCount})
                      </Text>
                    )}
                  </>
                )}
              </Container>

              <Container flexDirection="row" alignItems="baseline">
                <Text
                  variant="body"
                  weight="semibold"
                  color={theme.text.primary}
                >
                  {currency === "USD" ? "$" : currency}
                  {Math.round(price)}
                </Text>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  style={{ marginLeft: 2 }}
                >
                  /night
                </Text>
              </Container>
            </Container>
          </Container>
        </Container>
      </Container>
    );
  };

  if (loading && properties.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ListScreen
      title={t("search.results") || "Search Results"}
      showFilter={false}
      onFilter={handleFiltersPress}
      scrollable={false}
      showDivider={false}
    >
      <Container paddingHorizontal="md">
        <StatusBar style={isDark ? "light" : "dark"} />

        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                marginBottom: spacing.sm,
                borderRadius: radius.lg,
                overflow: "hidden",
              }}
              onPress={() => handlePropertyPress(item)}
              activeOpacity={0.7}
            >
              <PropertyCard property={item} />
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Container>
              {renderSearchSummary()}
              {renderResultsCount()}
            </Container>
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
          contentContainerStyle={
            properties.length === 0
              ? {
                  flex: 1,
                  justifyContent: "center",
                }
              : {}
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={
                isDark ? theme.colors.gray[800] : theme.white
              }
            />
          }
          ItemSeparatorComponent={() => (
            <Container height={spacing.sm}>
              <></>
            </Container>
          )}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </Container>
    </ListScreen>
  );
}
