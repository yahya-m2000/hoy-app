/**
 * Search screen for the Hoy application
 * Clean, modular search interface with recent searches functionality
 * Allows travelers to search for accommodations by location, dates, and guest count
 */

// React Native core
import React, { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";

// Expo and third-party libraries
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// App context and hooks
import { useTheme, useToast } from "@shared/context";
import { useSearchForm } from "@shared/hooks";

// Search components
import { SearchForm, RecentSearches } from "src/modules/search/components";
import {
  RecentSearchManager,
  type RecentSearch,
} from "@modules/search/components/RecentSearchManager";

// Constants
import { fontSize, fontWeight, spacing } from "@shared/constants";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { searchState, updateSearchState } = useSearchForm();
  const { showToast } = useToast();

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches on component mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      const searches = await RecentSearchManager.getRecentSearches();
      setRecentSearches(searches);
    };
    loadRecentSearches();
  }, []);

  // Show a toast message when location is selected but search hasn't been performed yet
  useEffect(() => {
    const location = searchState?.location || "";
    const dates = searchState?.displayDates || "";

    if (location && !dates) {
      showToast({
        message:
          t("search.locationSelectedHint") ||
          "Location selected! Now you can add dates and guests before searching.",
        type: "info",
        duration: 4000,
      });
    }
  }, [searchState?.location, searchState?.displayDates, showToast, t]);

  // Handle recent search selection
  const handleRecentSearchSelect = (search: RecentSearch) => {
    updateSearchState({
      location: search.location,
      displayDates: search.displayDates,
      startDate: search.startDate,
      endDate: search.endDate,
      adults: search.adults,
      children: search.children,
      rooms: search.rooms,
      displayTravelers: search.displayTravelers,
      coordinates: search.coordinates,
    });
  };

  // Remove a single recent search
  const removeRecentSearch = async (id: string) => {
    await RecentSearchManager.removeRecentSearch(id);
    const updatedSearches = await RecentSearchManager.getRecentSearches();
    setRecentSearches(updatedSearches);
  };

  // Clear all recent searches
  const clearAllRecentSearches = async () => {
    await RecentSearchManager.clearAllRecentSearches();
    setRecentSearches([]);
  };

  // Handle search submission
  const handleSearch = async () => {
    const location = searchState?.location || "";

    if (!location) {
      // Open location modal if no location selected
      router.push("/(overlays)/search/location");
      return;
    }

    // Add to recent searches when user performs a search (only if location exists)
    if (searchState.location) {
      const searchData = {
        location: searchState.location,
        displayDates: searchState.displayDates || "",
        startDate: searchState.startDate,
        endDate: searchState.endDate,
        adults: searchState.adults || 2,
        children: searchState.children || 0,
        rooms: searchState.rooms || 1,
        displayTravelers: searchState.displayTravelers || "2 guests, 1 room",
        coordinates: searchState.coordinates,
      };

      await RecentSearchManager.addRecentSearch(searchData);

      // Refresh recent searches list
      const updatedSearches = await RecentSearchManager.getRecentSearches();
      setRecentSearches(updatedSearches);
    }

    // Create a timestamp to force a new search (prevents caching issues)
    const timestamp = Date.now();

    // Navigate to results page with search parameters
    const searchParams: any = {
      location,
      startDate: searchState?.startDate || "",
      endDate: searchState?.endDate || "",
      displayDates: searchState?.displayDates || "",
      adults: searchState?.adults ? String(searchState.adults) : "2",
      children: searchState?.children ? String(searchState.children) : "0",
      rooms: searchState?.rooms ? String(searchState.rooms) : "1",
      displayTravelers: searchState?.displayTravelers || "2 guests, 1 room",
      // Add timestamp to force a fresh search (avoids caching issues with same parameters)
      _ts: timestamp.toString(),
    };

    // Add coordinates if available in search state
    if (searchState?.coordinates) {
      searchParams.latitude = String(searchState.coordinates.latitude);
      searchParams.longitude = String(searchState.coordinates.longitude);
      console.log("Including coordinates in search:", searchState.coordinates);
    }

    console.log("Navigating to Results with params:", searchParams);

    // Show toast to indicate search is in progress
    showToast({
      message: t("search.searchingProperties") || "Searching for properties...",
      type: "info",
      duration: 2000,
    });

    router.push({
      pathname: "/(tabs)/traveler/search/results",
      params: searchParams,
    });
  };

  // Create the content for the FlatList's ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Search Form */}
      <SearchForm onSearch={handleSearch} />

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <RecentSearches
            searches={recentSearches}
            onSearchSelect={handleRecentSearchSelect}
            onRemoveSearch={removeRecentSearch}
            onClearAll={clearAllRecentSearches}
          />
        </View>
      )}
    </>
  );

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

      {/* Using FlatList to avoid VirtualizedList nesting issues */}
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}
        renderItem={() => null}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    marginTop: spacing.xl,
  },
});
