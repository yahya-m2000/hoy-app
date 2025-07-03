/**
 * Search screen for the Hoy application
 * Clean, modular search interface with recent searches functionality
 * Allows travelers to search for accommodations by location, dates, and guest count
 */

import React, { useState, useEffect } from "react";
import { FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// Base components
import {
  Container,
  Screen,
  Icon,
  ListScreen,
  Header,
} from "@shared/components";

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
} from "src/features/search/components/RecentSearchManager";

export default function SearchScreen() {
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
      // Show a toast to prompt user to select location instead of navigating
      showToast({
        message:
          t("search.selectLocationFirst") || "Please select a location first",
        type: "warning",
        duration: 3000,
      });
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
    </>
  );

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={t("search.title") || "Search"}
        right={{
          children: (
            <Icon
              name="options-outline"
              size={iconSize.sm}
              color={theme.text.primary}
            />
          ),
          onPress: handleFiltersPress,
        }}
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
        />
      </Container>
    </Container>
  );
}
