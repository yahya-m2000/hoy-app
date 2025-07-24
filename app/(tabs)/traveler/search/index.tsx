/**
 * Search screen for the Hoy application
 * Clean, modular search interface with recent searches functionality
 * Allows travelers to search for accommodations by location, dates, and guest count
 */

import React, { useState, useEffect, useCallback } from "react";
import { FlatList, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// Base components
import { Container, Screen, Icon, Header, Text } from "@shared/components";

// App context and hooks
import { useToast } from "@core/context";
import { useTheme } from "@core/hooks";
import { useSearchForm } from "@features/search/hooks";

// Constants
import { spacing, iconSize } from "@core/design";

// Search components
import { SearchForm, RecentSearches } from "src/features/search/components";
import {
  RecentSearchManager,
  type RecentSearch,
} from "src/features/search/utils/RecentSearchManager";

// Utility to break a location string into { city, state, country }
const parseLocation = (
  locationStr: string
): { city?: string; state?: string; country?: string } => {
  if (!locationStr) return {};

  const tokens = locationStr.split(",").map((t) => t.trim());
  const lastToken = tokens[tokens.length - 1];

  // Simple parsing - assume last token is country, first is city/state
  return {
    city: tokens.length > 1 ? tokens[0] : undefined,
    country: lastToken,
  };
};

export default function SearchScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { searchState, updateSearchState } = useSearchForm();
  const { showToast } = useToast();

  // State management
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load recent searches
  const loadRecentSearches = useCallback(async () => {
    try {
      const searches = await RecentSearchManager.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
      showToast({
        message:
          t("search.errorLoadingRecent") || "Error loading recent searches",
        type: "error",
      });
    }
  }, [showToast, t]);

  // Load recent searches on component mount
  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRecentSearches();
    setIsRefreshing(false);
  }, [loadRecentSearches]);

  // Removed the problematic toast effect that was causing infinite loops

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
  const removeRecentSearch = useCallback(
    async (id: string) => {
      try {
        await RecentSearchManager.removeRecentSearch(id);
        await loadRecentSearches();
        showToast({
          message: t("search.recentSearchRemoved") || "Recent search removed",
          type: "success",
        });
      } catch (error) {
        console.error("Error removing recent search:", error);
        showToast({
          message:
            t("search.errorRemovingRecent") || "Error removing recent search",
          type: "error",
        });
      }
    },
    [loadRecentSearches, showToast, t]
  );

  // Clear all recent searches
  const clearAllRecentSearches = useCallback(async () => {
    try {
      await RecentSearchManager.clearAllRecentSearches();
      setRecentSearches([]);
      showToast({
        message:
          t("search.allRecentSearchesCleared") || "All recent searches cleared",
        type: "success",
      });
    } catch (error) {
      console.error("Error clearing recent searches:", error);
      showToast({
        message:
          t("search.errorClearingRecent") || "Error clearing recent searches",
        type: "error",
      });
    }
  }, [showToast, t]);

  // Handle search submission
  const handleSearch = useCallback(async () => {
    const location = searchState?.location || "";

    if (!location) {
      showToast({
        message:
          t("search.selectLocationFirst") || "Please select a location first",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Add to recent searches when user performs a search
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
        await loadRecentSearches(); // Refresh the list
      }

      // Create a timestamp to force a new search (prevents caching issues)
      const timestamp = Date.now();

      // Break the location string into structured parts
      const { city, state, country } = parseLocation(location);

      // Build search params
      const searchParams: any = {
        ...(city ? { city } : {}),
        ...(state ? { state } : {}),
        ...(country ? { country } : {}),
        location,
        startDate: searchState?.startDate || "",
        endDate: searchState?.endDate || "",
        displayDates: searchState?.displayDates || "",
        adults: searchState?.adults ? String(searchState.adults) : "2",
        children: searchState?.children ? String(searchState.children) : "0",
        rooms: searchState?.rooms ? String(searchState.rooms) : "1",
        displayTravelers: searchState?.displayTravelers || "2 guests, 1 room",
        _ts: timestamp.toString(),
      };

      // Add coordinates if available in search state
      if (searchState?.coordinates) {
        searchParams.latitude = String(searchState.coordinates.latitude);
        searchParams.longitude = String(searchState.coordinates.longitude);
      }

      // Show toast to indicate search is in progress
      showToast({
        message:
          t("search.searchingProperties") || "Searching for properties...",
        type: "info",
        duration: 2000,
      });

      router.push({
        pathname: "/(tabs)/traveler/search/results",
        params: searchParams,
      });
    } catch (error) {
      console.error("Error performing search:", error);
      showToast({
        message: t("search.errorPerformingSearch") || "Error performing search",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchState, showToast, t, router, loadRecentSearches]);

  // Handle filters press
  const handleFiltersPress = () => {
    // Navigate to filters screen
    router.push({
      pathname: "/(overlays)/search/filters",
      params: {
        location: searchState?.location || "",
        checkIn: searchState?.startDate || "",
        checkOut: searchState?.endDate || "",
        guests: searchState?.displayTravelers || "",
        returnTo: "/search",
      },
    });
  };

  // Create the content for the FlatList's ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Search Form */}
      <SearchForm onSearch={handleSearch} />

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <Container>
          <RecentSearches
            searches={recentSearches}
            onSearchSelect={handleRecentSearchSelect}
            onRemoveSearch={removeRecentSearch}
            onClearAll={clearAllRecentSearches}
          />
        </Container>
      )}

      {/* Empty state when no recent searches */}
      {recentSearches.length === 0 && (
        <Container alignItems="center" paddingVertical="xl">
          <Icon
            name="search-outline"
            size={48}
            color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
          />
          <Text
            variant="body"
            color="secondary"
            style={{ marginTop: spacing.md, textAlign: "center" }}
          >
            {t("search.noRecentSearches") || "No recent searches yet"}
          </Text>
          <Text
            variant="caption"
            color="tertiary"
            style={{ marginTop: spacing.sm, textAlign: "center" }}
          >
            {t("search.startSearchingToSeeHistory") ||
              "Start searching to see your search history here"}
          </Text>
        </Container>
      )}
    </>
  );

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={t("search.title") || "Search"}
        // right={{
        //   children: (
        //     <Icon
        //       name="options-outline"
        //       size={iconSize.sm}
        //       color={theme.text.primary}
        //     />
        //   ),
        //   onPress: handleFiltersPress,
        // }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
      <Container padding="md">
        {/* Using FlatList to avoid VirtualizedList nesting issues */}
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          data={[{ key: "content" }]}
          keyExtractor={(item) => item.key}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      </Container>
    </Container>
  );
}
