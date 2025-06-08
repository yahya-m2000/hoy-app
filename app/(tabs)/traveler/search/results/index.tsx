/**
 * Search Results screen for the Hoy application
 * Displays properties matching search criteria
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@shared/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PropertyType } from "@shared/types";
import { useProperties } from "@shared/hooks";
import { searchProperties } from "@shared/services/api/properties";
import { formatCoordinateParams } from "@shared/utils/validation";

import {
  SearchSummary,
  FiltersBar,
  PropertyList,
  LoadingState,
  SearchEmptyState,
  type FilterOption,
  type SortOrder,
} from "@modules/search/components";

import { parseLocation } from "@shared/utils";
import { spacing } from "@shared/constants";

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
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
  const [sortOrder] = useState<SortOrder>("desc");
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
  });
  // Use manual results if loaded directly, otherwise use hook results
  const currentProperties = isDirectLoaded ? manualResults : properties;

  // Filter properties based on active filter
  const filteredProperties = useMemo(() => {
    if (activeFilter === "all") return currentProperties;

    return currentProperties.filter((property) => {
      switch (activeFilter) {
        case "rating":
          return (property.rating || 0) >= 4.5;
        case "price":
          const priceAmount =
            typeof property.price === "object"
              ? property.price.amount
              : property.price || 0;
          return priceAmount <= 200; // Filter for affordable properties
        case "newest":
          return true; // Could filter by creation date if available
        default:
          return true;
      }
    });
  }, [currentProperties, activeFilter]);
  // Sort properties
  const filteredAndSortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    sorted.sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          const priceA =
            typeof a.price === "object" ? a.price.amount : a.price || 0;
          const priceB =
            typeof b.price === "object" ? b.price.amount : b.price || 0;
          return priceA - priceB;
        case "desc":
          const priceA2 =
            typeof a.price === "object" ? a.price.amount : a.price || 0;
          const priceB2 =
            typeof b.price === "object" ? b.price.amount : b.price || 0;
          return priceB2 - priceA2;
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredProperties, sortOrder]);

  // Load properties when search changes
  useEffect(() => {
    if (!isDirectLoaded && location) {
      fetchProperties();
    }
  }, [
    fetchProperties,
    location,
    startDate,
    endDate,
    adults,
    children,
    rooms,
    propertyType,
    isDirectLoaded,
  ]);

  // Direct search function for manual searches
  const performDirectSearch = useCallback(async () => {
    if (!location) return;

    try {
      setRefreshing(true);
      console.log("Performing direct search with params:", {
        location,
        city,
        state,
        country,
        startDate,
        endDate,
        guests: adults + children,
        rooms,
        propertyType,
        latitude: hasCoordinates ? latitude : undefined,
        longitude: hasCoordinates ? longitude : undefined,
      });

      let searchParams: any = {
        city,
        state,
        country,
        startDate,
        endDate,
        guests: adults + children,
        rooms,
        propertyType,
      };

      // Add coordinates if available and valid
      if (hasCoordinates) {
        const formattedCoords = formatCoordinateParams(latitude!, longitude!);
        searchParams = { ...searchParams, ...formattedCoords };
      }

      const results = await searchProperties(searchParams);
      console.log(`Direct search returned ${results?.length || 0} properties`);

      setManualResults(results || []);
      setIsDirectLoaded(true);
    } catch (error) {
      console.error("Direct search error:", error);
      setManualResults([]);
    } finally {
      setRefreshing(false);
    }
  }, [
    location,
    city,
    state,
    country,
    startDate,
    endDate,
    adults,
    children,
    rooms,
    propertyType,
    hasCoordinates,
    latitude,
    longitude,
  ]);
  // Handle property press
  const handlePropertyPress = useCallback(
    (property: PropertyType) => {
      router.push({
        pathname: "/(tabs)/traveler/search/[id]" as any,
        params: {
          propertyId: property._id,
          title: property.name || property.title,
          pricePerNight:
            (typeof property.price === "object"
              ? property.price.amount
              : property.price
            )?.toString() || "0",
          averageRating: property.rating?.toString() || "0",
          totalReviews: property.reviewCount?.toString() || "0",
          // Pass search parameters for context
          searchLocation: location,
          searchStartDate: startDate,
          searchEndDate: endDate,
          searchAdults: adults.toString(),
          searchChildren: children.toString(),
          returnTo: "/(tabs)/traveler/search",
          searchRooms: rooms.toString(),
        },
      });
    },
    [router, location, startDate, endDate, adults, children, rooms]
  );

  // Apply filter
  const applyFilter = useCallback((filter: FilterOption) => {
    setActiveFilter(filter);
  }, []);

  // Toggle map view
  const toggleMapView = useCallback(() => {
    setShowMap(!showMap);
  }, [showMap]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    if (isDirectLoaded) {
      performDirectSearch();
    } else {
      fetchProperties();
    }
  }, [isDirectLoaded, performDirectSearch, fetchProperties]);
  // Perform direct search on mount if we have valid search parameters
  useEffect(() => {
    if (location && !isDirectLoaded) {
      performDirectSearch();
    }
  }, [location, isDirectLoaded, performDirectSearch]);

  // Determine what to show
  const showLoading = loading || refreshing;
  const showEmpty = !showLoading && filteredAndSortedProperties.length === 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <SearchSummary
        resultsCount={filteredAndSortedProperties.length}
        location={location}
        guests={adults + children}
        dates={
          startDate && endDate
            ? `${new Date(startDate).toLocaleDateString()} - ${new Date(
                endDate
              ).toLocaleDateString()}`
            : undefined
        }
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
        <SearchEmptyState
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: spacing.xl,
    // paddingHorizontal: spacing.lg,
  },
});
