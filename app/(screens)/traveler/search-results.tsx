/**
 * Search Results screen for the Hoy application
 * Displays properties matching search criteria
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import type { PropertyType } from "@common/types/property";
import { useProperties } from "@common/hooks/useProperties";
import { searchProperties } from "@host/services/propertyService";
import { formatCoordinateParams } from "@common/utils/validation/coordinateValidation";
import {
  SearchResultsHeader,
  SearchSummary,
  FiltersBar,
  PropertyList,
  LoadingState,
  EmptyState,
  type FilterOption,
  type SortOrder,
} from "src/traveler/components/screens/SearchResults";
import { parseLocation } from "@common/utils/locationParser";

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
  }, [location, hasCoordinates, latitude, longitude]); // Parse location string into city, state, and country components
  const { city, state, country } = useMemo(() => {
    if (!location) return { city: "", state: "", country: "" };

    const parsed = parseLocation(location);
    console.log(`Parsed location "${location}":`, {
      city: parsed.city,
      state: parsed.state,
      country: parsed.country,
    });

    return parsed;
  }, [location]);

  const propertyType =
    typeof params.propertyType === "string" ? params.propertyType : "";

  // State variables
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualResults, setManualResults] = useState<PropertyType[]>([]);
  const [isDirectLoaded, setIsDirectLoaded] = useState(false); // Use custom hook to fetch properties - only pass parsed components, not the full location
  const { properties, loading, error, fetchProperties } = useProperties({
    city,
    state,
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
          const searchQuery: any = {}; // Add city/state/country if available
          if (city) searchQuery.city = city;
          if (state) searchQuery.state = state;
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
          console.log("Directly calling searchProperties API with:", {
            ...searchQuery,
            debug: `Parsed from "${location}" -> city: "${city}", state: "${state}", country: "${country}"`,
          }); // Make the API call directly with fallback strategy
          let results = await searchProperties(searchQuery);

          // If no results found with specific search, try fallback strategies
          if (results.length === 0 && isMounted) {
            console.log(
              "No results with specific search, trying fallback strategies..."
            );

            // Fallback 1: Try state + country only (remove city filter)
            if (city && state && country) {
              console.log("Fallback 1: Searching by state + country only");
              const fallbackQuery1 = {
                state: searchQuery.state,
                country: searchQuery.country,
                ...(searchQuery.lat && {
                  lat: searchQuery.lat,
                  lng: searchQuery.lng,
                  radius: searchQuery.radius,
                }),
              };
              results = await searchProperties(fallbackQuery1);
              console.log(`Fallback 1 returned ${results.length} properties`);
            }

            // Fallback 2: Try country only if still no results
            if (results.length === 0 && country) {
              console.log("Fallback 2: Searching by country only");
              const fallbackQuery2 = {
                country: searchQuery.country,
                ...(searchQuery.lat && {
                  lat: searchQuery.lat,
                  lng: searchQuery.lng,
                  radius: searchQuery.radius,
                }),
              };
              results = await searchProperties(fallbackQuery2);
              console.log(`Fallback 2 returned ${results.length} properties`);
            }

            // Fallback 3: Try coordinate-based search only if we have coordinates
            if (results.length === 0 && hasCoordinates && searchQuery.lat) {
              console.log(
                "Fallback 3: Searching by coordinates only with larger radius"
              );
              const fallbackQuery3 = {
                lat: searchQuery.lat,
                lng: searchQuery.lng,
                radius: 50, // Increase radius to 50km
              };
              results = await searchProperties(fallbackQuery3);
              console.log(`Fallback 3 returned ${results.length} properties`);
            }
          }

          if (isMounted) {
            console.log(`Final search result: ${results.length} properties`);
            directSearchCompleted = true;

            // Store results in our local state
            if (results.length > 0) {
              setManualResults(results);
              setIsDirectLoaded(true);
              // Also call fetchProperties to update the loading state
              fetchProperties();
            } else {
              console.log("No properties found even with fallback strategies");
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
  }, [
    location,
    city,
    state,
    country,
    hasCoordinates,
    latitude,
    longitude,
    fetchProperties,
  ]);

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

  // Show loading or property list
  const showLoading =
    loading && !refreshing && filteredAndSortedProperties.length === 0;
  const showEmpty =
    !loading && !refreshing && filteredAndSortedProperties.length === 0;

  // Calculate total guests for summary
  const totalGuests = adults + children;
  return (
    <SafeAreaView
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
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SearchResultsHeader
        title={city && country ? `${city}, ${country}` : location}
      />

      <SearchSummary
        location={location}
        guests={totalGuests}
        resultsCount={filteredAndSortedProperties.length}
        dates={startDate && endDate ? `${startDate} - ${endDate}` : undefined}
      />

      <FiltersBar
        activeFilter={activeFilter}
        sortOrder={sortOrder}
        showMap={showMap}
        onFilterChange={applyFilter}
        onToggleMap={toggleMapView}
      />

      {showLoading && (
        <LoadingState
          message={t("search.finding") || "Finding perfect properties..."}
        />
      )}

      {showEmpty && (
        <EmptyState
          isError={!!error}
          errorMessage={error || undefined}
          onRetry={error ? onRefresh : undefined}
        />
      )}

      {!showLoading && !showEmpty && (
        <PropertyList
          properties={filteredAndSortedProperties}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onPropertyPress={handlePropertyPress}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
