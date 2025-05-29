/**
 * Search Results screen for the Hoy application
 * Displays properties matching search criteria
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "@common-context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
import PropertyCard from "@common-components/PropertyCard";
import type { PropertyType } from "@common/types/property";
import { useProperties } from "@common-hooks/useProperties";
import { searchProperties } from "@host-services/propertyService";
import { formatCoordinateParams } from "@common-utils/validation/coordinateValidation";

// Available filter and sort options
type FilterOption = "all" | "price" | "rating" | "newest";
type SortOrder = "asc" | "desc";

export default function SearchResultsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract search parameters
  const location = typeof params.location === "string" ? params.location : "";
  const startDate =
    typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const adults =
    typeof params.adults === "string" ? parseInt(params.adults, 10) : 2;
  const children =
    typeof params.children === "string" ? parseInt(params.children, 10) : 0;
  const rooms =
    typeof params.rooms === "string" ? parseInt(params.rooms, 10) : 1;

  // Extract coordinates if available
  const latitude =
    typeof params.latitude === "string"
      ? parseFloat(params.latitude)
      : undefined;
  const longitude =
    typeof params.longitude === "string"
      ? parseFloat(params.longitude)
      : undefined;

  // Check if we have valid coordinates
  const hasCoordinates = !isNaN(Number(latitude)) && !isNaN(Number(longitude));

  // Log coordinate information for debugging
  useEffect(() => {
    console.log(
      `Search location: ${location}, has coordinates: ${hasCoordinates}`
    );
    if (hasCoordinates) {
      console.log(`Coordinates: ${latitude}, ${longitude}`);
    }
  }, [location, hasCoordinates, latitude, longitude]);

  // Extract city and country from location string if available
  const [city, country] = useMemo(() => {
    if (!location) return ["", ""];
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length >= 2) {
      return [parts[0], parts[parts.length - 1]]; // First part as city, last part as country
    }
    return [location, ""]; // If there's only one part, use it as city
  }, [location]);

  const propertyType =
    typeof params.propertyType === "string" ? params.propertyType : "";

  // State variables
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualResults, setManualResults] = useState<PropertyType[]>([]);
  const [isDirectLoaded, setIsDirectLoaded] = useState(false);

  // Use custom hook to fetch properties
  const { properties, loading, error, fetchProperties } = useProperties({
    location,
    city,
    country,
    startDate,
    endDate,
    guests: adults + children,
    rooms,
    propertyType,
    coordinates: hasCoordinates
      ? { latitude: latitude!, longitude: longitude!, radius: 10 }
      : undefined,
  });

  // Direct API call to ensure we get results
  useEffect(() => {
    console.log("Results screen mounted - preparing to fetch data");

    let isMounted = true;
    let directSearchCompleted = false;

    const timer = setTimeout(async () => {
      if (!isMounted) return;

      console.log("Results screen - executing delayed API calls");

      // Explicitly call the API search function directly
      const searchDirectly = async () => {
        if (directSearchCompleted || !isMounted) return;

        try {
          // Create the search query
          const searchQuery: any = {};

          // Add city/country if available
          if (city) searchQuery.city = city;
          if (country) searchQuery.country = country;

          // Add coordinates if available
          if (
            hasCoordinates &&
            latitude !== undefined &&
            longitude !== undefined
          ) {
            const validCoords = formatCoordinateParams(latitude, longitude, 10);
            if (validCoords) {
              searchQuery.lat = validCoords.latitude;
              searchQuery.lng = validCoords.longitude;
              searchQuery.radius = validCoords.radius;

              console.log("Using server-compatible coordinate format:", {
                lat: searchQuery.lat,
                lng: searchQuery.lng,
                radius: searchQuery.radius,
              });
            } else {
              console.error("Invalid coordinates, skipping coordinate search");
            }
          }

          console.log(
            "Directly calling searchProperties API with:",
            searchQuery
          );

          // Make the API call directly
          const results = await searchProperties(searchQuery);
          if (isMounted) {
            console.log(
              `Direct API call returned ${results.length} properties`
            );
            directSearchCompleted = true;

            // Store results in our local state
            if (results.length > 0) {
              setManualResults(results);
              setIsDirectLoaded(true);
              // Also call fetchProperties to update the loading state
              fetchProperties();
            }
          }
        } catch (err: any) {
          console.error("Error making direct API call:", err);

          if (err.response) {
            console.error("API Error Response:", {
              status: err.response.status,
              data: err.response.data,
            });
          }
        }
      };

      await searchDirectly();

      // Also call the hook's fetchProperties
      if (isMounted) {
        fetchProperties();
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [city, country, hasCoordinates, latitude, longitude, fetchProperties]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    if (loading) {
      console.log("Refresh prevented - already loading data");
      return;
    }

    setRefreshing(true);

    const timeoutId = setTimeout(() => {
      setRefreshing(false);
    }, 5000);

    fetchProperties()
      .then(() => {
        clearTimeout(timeoutId);
        setRefreshing(false);
      })
      .catch((err: any) => {
        clearTimeout(timeoutId);
        setRefreshing(false);
        console.error("Error refreshing properties:", err);
      });
  }, [fetchProperties, loading]);

  // Apply active filter
  const applyFilter = (filter: FilterOption) => {
    setActiveFilter(filter);
    // Toggle sort order when pressing the same filter again
    if (filter === activeFilter) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
  };
  // Filter and sort properties based on active filter
  const filteredAndSortedProperties = useMemo(() => {
    // Use manual results if available, otherwise use properties from the hook
    const dataToFilter =
      isDirectLoaded && manualResults.length > 0 ? manualResults : properties;

    if (!dataToFilter || dataToFilter.length === 0) {
      return [];
    }

    // Process the property data to ensure all required fields have valid values
    const processedProperties = dataToFilter.map((property: any) => ({
      ...property,
      // Ensure required properties have valid values
      _id: property._id || Math.random().toString(),
      title: property.title || "Unnamed Property",
      price: property.price || 0,
      rating: property.rating || 0,
      reviewCount: property.reviewCount || 0,
      // Format location if it's an object
      location:
        typeof property.location === "string"
          ? property.location
          : property.locationString ||
            `${property.city || ""}, ${property.country || ""}`,
    }));

    let result = [...processedProperties];

    switch (activeFilter) {
      case "price":
        result = result.sort((a, b) =>
          sortOrder === "asc" ? a.price - b.price : b.price - a.price
        );
        break;
      case "rating":
        result = result.sort((a, b) =>
          sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
        );
        break;
      case "newest":
        result = result.sort((a, b) => {
          // Extract numeric part from _id if possible, or use string comparison
          const matchA = a._id.match(/\d+/);
          const matchB = b._id.match(/\d+/);
          const idA = matchA ? parseInt(matchA[0], 10) : 0;
          const idB = matchB ? parseInt(matchB[0], 10) : 0;
          return sortOrder === "asc" ? idA - idB : idB - idA;
        });
        break;
      default:
        // Default sorting is by highest rating
        result = result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [properties, manualResults, isDirectLoaded, activeFilter, sortOrder]);

  // Navigate to property details screen
  const handlePropertyPress = (property: PropertyType) => {
    router.push({
      pathname: "/(screens)/traveler/property-details",
      params: { property: JSON.stringify(property) },
    });
  };

  // Toggle map view
  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  // Filter options
  const filterOptions = [
    { id: "all", label: t("search.filters.all") },
    { id: "price", label: t("search.filters.price") },
    { id: "rating", label: t("search.filters.rating") },
    { id: "newest", label: t("search.filters.newest") },
  ];

  // Render filter option button
  const renderFilterOption = ({
    item,
  }: {
    item: { id: string; label: string };
  }) => {
    const isActive = activeFilter === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.filterOption,
          {
            backgroundColor: isActive
              ? theme.colors.primary
              : isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.grayPalette[50],
            borderColor: isActive
              ? theme.colors.primary
              : isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[300],
            shadowColor: theme.colors.grayPalette[900],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.1,
            shadowRadius: 2,
            elevation: isActive ? 3 : 0,
          },
        ]}
        onPress={() => applyFilter(item.id as FilterOption)}
      >
        {isActive && item.id !== "all" && (
          <Ionicons
            name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
            size={12}
            color={theme.colors.white}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            styles.filterOptionText,
            {
              color: isActive
                ? theme.colors.white
                : isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[700],
              fontWeight: isActive ? "600" : "normal",
            },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render empty state or error
  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={
              isDark
                ? theme.colors.errorPalette[400]
                : theme.colors.errorPalette[500]
            }
          />
          <Text
            style={[
              styles.emptyStateText,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {error || t("search.errorLoading") || "Error loading properties"}
          </Text>
          <Text
            style={[
              styles.emptyStateSubtext,
              {
                color: isDark
                  ? theme.colors.grayPalette[500]
                  : theme.colors.grayPalette[500],
                marginTop: 8,
              },
            ]}
          >
            {t("search.checkParameters") ||
              "Please check your search parameters"}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.grayPalette[900],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
            onPress={() => fetchProperties()}
          >
            <Text style={styles.retryButtonText}>
              {t("search.retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={
            isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[400]
          }
        />
        <Text
          style={[
            styles.emptyStateText,
            {
              color: isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          {t("search.noResults") || "No properties found"}
        </Text>
        <Text
          style={[
            styles.emptyStateSubtext,
            {
              color: isDark
                ? theme.colors.grayPalette[500]
                : theme.colors.grayPalette[500],
            },
          ]}
        >
          {t("search.tryDifferentSearch") || "Try adjusting your search"}
        </Text>
      </View>
    );
  };

  // Show loading or property list
  const showLoading =
    loading && !refreshing && filteredAndSortedProperties.length === 0;
  const showPropertyList =
    !showLoading || filteredAndSortedProperties.length > 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View
        style={[
          styles.customHeader,
          {
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              isDark
                ? theme.colors.grayPalette[100]
                : theme.colors.grayPalette[800]
            }
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: isDark
                  ? theme.colors.grayPalette[100]
                  : theme.colors.grayPalette[800],
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {city && country ? `${city}, ${country}` : location}
          </Text>
        </View>
      </View>

      {/* Loading indicator */}
      {showLoading && (
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[50],
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
                shadowColor: theme.colors.grayPalette[900],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 5,
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[100]
                    : theme.colors.grayPalette[800],
                },
              ]}
            >
              {t("search.finding") || "Finding perfect properties..."}
            </Text>
            {__DEV__ && (
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  backgroundColor: theme.colors.primary,
                  padding: 8,
                  borderRadius: 4,
                }}
                onPress={() => {
                  console.log("Debug: Force refreshing UI");
                  fetchProperties();
                }}
              >
                <Text style={{ color: "white" }}>Debug: Force Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search summary bar */}
      <View
        style={[
          styles.searchSummary,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.grayPalette[50],
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[300],
          },
        ]}
      />

      {/* Filters row */}
      <View
        style={[
          styles.filtersContainer,
          {
            borderBottomColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderFilterOption}
          contentContainerStyle={styles.filtersList}
        />

        <TouchableOpacity
          style={[
            styles.mapButton,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[50],
              borderColor: isDark
                ? theme.colors.grayPalette[600]
                : theme.colors.grayPalette[300],
              shadowColor: theme.colors.grayPalette[900],
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 1,
            },
          ]}
          onPress={toggleMapView}
        >
          <Ionicons
            name={showMap ? "list" : "map"}
            size={16}
            color={
              isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[700]
            }
          />
        </TouchableOpacity>
      </View>

      {/* Properties list */}
      {showPropertyList && (
        <FlatList
          data={filteredAndSortedProperties}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={({ item }) => {
            // Make sure we have a valid location string
            const locationText =
              typeof item.location === "string"
                ? item.location
                : item.locationString ||
                  `${item.city || ""}, ${item.country || ""}`;

            return (
              <PropertyCard
                _id={item._id}
                title={item.title}
                location={locationText}
                price={item.price}
                imageUrl={item.images?.[0]}
                images={item.images}
                rating={item.rating}
                reviewCount={item.reviewCount}
                onPress={() => handlePropertyPress(item)}
                style={styles.propertyCard}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={
                isDark ? theme.colors.grayPalette[300] : theme.colors.primary
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    alignContent: "center",
    width: "100%",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "black", // Will be styled dynamically
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    fontWeight: "400",
    marginTop: spacing.xs,
    color: "black", // Will be styled dynamically
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.xs,
    alignSelf: "flex-start",
  },
  closeButton: {
    position: "absolute",
    top: spacing.lg + 40, // Account for status bar and header
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    width: "80%",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: "500",
    textAlign: "center",
  },
  searchSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchDetails: {
    flex: 1,
  },
  searchDetailsText: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  searchQuery: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flex: 1,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterOptionText: {
    fontSize: fontSize.xs,
    marginRight: 4,
  },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: fontSize.md,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
