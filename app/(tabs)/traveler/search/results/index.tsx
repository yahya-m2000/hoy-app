/**
 * Search Results Screen
 * Displays properties based on search criteria with filtering and sorting options
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Context and hooks
import { useToast } from "@shared/context";
import { useTheme } from "@shared/hooks/useTheme";
import { useProperties, type SearchParams } from "@shared/hooks";

// Components
import {
  LoadingSpinner,
  EmptyState,
  PropertyImageContainer,
} from "@shared/components";

// Types
import type { PropertyType } from "@shared/types/property";

// Constants
import { fontSize, fontWeight, spacing, wireframe } from "@shared/constants";

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
    if (error) {
      showToast({
        message: error,
        type: "error",
        duration: 4000,
      });
    }
  }, [error, showToast]); // Handle property press
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

  // Render search summary
  const renderSearchSummary = () => {
    const locationText = (params.location as string) || t("search.anyLocation");
    const datesText = (params.displayDates as string) || t("search.anyDates");
    const guestsText =
      (params.displayTravelers as string) || t("search.anyGuests");

    return (
      <View
        style={[
          styles.searchSummary,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : wireframe.surface,
          },
        ]}
      >
        <View style={styles.searchInfo}>
          <Text
            style={[styles.searchLocation, { color: theme.colors.gray[900] }]}
            numberOfLines={1}
          >
            {locationText}
          </Text>
          <Text
            style={[styles.searchDetails, { color: theme.colors.gray[600] }]}
          >
            {datesText} • {guestsText}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={theme.colors.gray[600]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Render results count
  const renderResultsCount = () => {
    if (loading) return null;

    return (
      <View style={styles.resultsCount}>
        <Text style={[styles.countText, { color: theme.colors.gray[600] }]}>
          {properties.length === 0
            ? t("search.noResults")
            : t("search.resultsFound", { count: properties.length })}
        </Text>
      </View>
    );
  };
  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      icon="search-outline"
      title={t("search.noPropertiesFound")}
      message={t("search.tryAdjustingFilters")}
      action={{
        label: t("search.newSearch"),
        onPress: () => router.back(),
      }}
    />
  );

  if (loading && properties.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : wireframe.background,
        },
      ]}
    >
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.propertyCard,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              },
            ]}
            onPress={() => handlePropertyPress(item)}
            activeOpacity={0.7}
          >
            <PropertyCard property={item} />
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View>
            {renderSearchSummary()}
            {renderResultsCount()}
          </View>
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={
          properties.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
}

// Simplified PropertyCard component for search results
const PropertyCard: React.FC<{ property: PropertyType }> = ({ property }) => {
  const { theme } = useTheme();

  const price =
    typeof property.price === "object" ? property.price.amount : property.price;
  const currency =
    typeof property.price === "object" ? property.price.currency : "USD";

  return (
    <View style={styles.card}>
      <View style={styles.cardContainer}>
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <PropertyImageContainer
            images={property.images}
            containerStyle={styles.imageWrapper}
            imageStyle={styles.propertyImage}
            variant="small"
          />
        </View>

        {/* Property Content */}
        <View style={styles.cardContent}>
          <Text
            style={[styles.propertyName, { color: theme.colors.gray[900] }]}
            numberOfLines={2}
          >
            {property.name || property.title}
          </Text>

          <Text
            style={[styles.propertyType, { color: theme.colors.gray[600] }]}
            numberOfLines={1}
          >
            {property.type || "Property"}
          </Text>

          <View style={styles.propertyFooter}>
            <View style={styles.rating}>
              {property.rating && property.rating > 0 && (
                <>
                  <Ionicons
                    name="star"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.ratingText,
                      { color: theme.colors.gray[700] },
                    ]}
                  >
                    {property.rating.toFixed(1)}
                  </Text>
                  {property.reviewCount && property.reviewCount > 0 && (
                    <Text
                      style={[
                        styles.reviewCount,
                        { color: theme.colors.gray[500] },
                      ]}
                    >
                      ({property.reviewCount})
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.gray[900] }]}>
                {currency === "USD" ? "$" : currency}
                {Math.round(price)}
              </Text>
              <Text
                style={[styles.priceUnit, { color: theme.colors.gray[600] }]}
              >
                /night
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
  },
  searchSummary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  searchInfo: {
    flex: 1,
  },
  searchLocation: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  searchDetails: {
    fontSize: fontSize.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  resultsCount: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  countText: {
    fontSize: fontSize.sm,
  },
  propertyCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  card: {
    padding: spacing.md,
  },
  cardContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  propertyImage: {
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "space-between",
  },
  propertyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * 1.2,
  },
  propertyType: {
    fontSize: fontSize.sm,
    textTransform: "capitalize",
  },
  propertyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  reviewCount: {
    fontSize: fontSize.xs,
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  priceUnit: {
    fontSize: fontSize.sm,
    marginLeft: 2,
  },
});
