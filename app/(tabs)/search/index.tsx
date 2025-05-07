/**
 * Search screen for the Hoy application
 * Expedia-style search interface with property types and recent searches
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "../../../src/constants/typography";
import { spacing } from "../../../src/constants/spacing";
import { radius } from "../../../src/constants/radius";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSearchForm } from "../../../src/hooks/useSearchForm";
import { useToast } from "../../../src/context/ToastContext";

// Get screen dimensions for responsive grid
const { width } = Dimensions.get("window");
const itemWidth = (width - spacing.lg * 3) / 2; // 2 items per row, 3 paddings (left, right, middle)

// Mock recent searches
interface RecentSearch {
  id: string;
  city: string;
  date: string;
  guests: number;
  rooms: number;
  timestamp: number;
}

const mockRecentSearches: RecentSearch[] = [
  {
    id: "1",
    city: "Paris",
    date: "Apr 25 - Apr 30",
    guests: 2,
    rooms: 1,
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
  },
  {
    id: "2",
    city: "London",
    date: "May 10 - May 15",
    guests: 4,
    rooms: 2,
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
  },
  {
    id: "3",
    city: "New York",
    date: "Jun 5 - Jun 12",
    guests: 1,
    rooms: 1,
    timestamp: Date.now() - 86400000 * 7, // 7 days ago
  },
];

// Property type definition
interface PropertyTypeItem {
  id: string;
  title: string;
  icon: string; // Ionicons name
}

export default function SearchScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { searchState, updateSearchState } = useSearchForm();
  const { showToast } = useToast();

  // Use values from centralized state first, fallback to URL params if needed
  const location = searchState?.location || "";
  const dates = searchState?.displayDates || "";
  const travelers = searchState?.displayTravelers || "2 guests, 1 room";
  const propertyType = searchState?.propertyType || "";

  // Show a toast message when location is selected but search hasn't been performed yet
  useEffect(() => {
    if (location && !dates) {
      showToast({
        message:
          "Location selected! Now you can add dates and guests before searching.",
        type: "info",
        duration: 4000,
      });
    }
  }, [location, dates, showToast]);

  const [recentSearches, setRecentSearches] =
    useState<RecentSearch[]>(mockRecentSearches);

  // Property types for the 2x3 grid
  const propertyTypes: PropertyTypeItem[] = [
    { id: "hotel", title: t("propertyTypes.hotel"), icon: "business" },
    { id: "apartment", title: t("propertyTypes.apartment"), icon: "home" },
    { id: "villa", title: t("propertyTypes.villa"), icon: "home-outline" },
    { id: "cottage", title: t("propertyTypes.cottage"), icon: "bed-outline" },
    {
      id: "cabin",
      title: t("propertyTypes.cabin"),
      icon: "trail-sign-outline",
    },
    {
      id: "resort",
      title: t("propertyTypes.resort"),
      icon: "umbrella-outline",
    },
  ];

  // Open property type modal
  const openPropertyTypeModal = (type: PropertyTypeItem) => {
    updateSearchState({ propertyType: type.id });

    router.push({
      pathname: "/(modals)/PropertyTypeModal",
      params: {
        type: type.id,
      },
    });
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (search: RecentSearch) => {
    // Update the centralized state with all the information from the recent search
    updateSearchState({
      location: search.city,
      displayDates: search.date,
      adults: search.guests,
      rooms: search.rooms,
      displayTravelers: `${search.guests} ${
        search.guests === 1 ? t("search.guest") : t("search.guests")
      }, ${search.rooms} ${
        search.rooms === 1 ? t("search.room") : t("search.rooms")
      }`,
    });
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  // Remove a single recent search
  const removeRecentSearch = (id: string) => {
    setRecentSearches(recentSearches.filter((item) => item.id !== id));
  }; // Handle search submission
  const handleSearch = () => {
    if (!location) {
      // Open location modal if no location selected
      router.push("/(modals)/SearchLocationModal");
      return;
    }

    // Create a timestamp to force a new search (prevents caching issues)
    const timestamp = Date.now();

    // Navigate to results page with search parameters
    const searchParams: any = {
      location,
      startDate: searchState?.startDate || "",
      endDate: searchState?.endDate || "",
      displayDates: dates || "",
      adults: searchState?.adults ? String(searchState.adults) : "2",
      children: searchState?.children ? String(searchState.children) : "0",
      rooms: searchState?.rooms ? String(searchState.rooms) : "1",
      propertyType: propertyType || "",
      displayTravelers: travelers || "2 guests, 1 room",
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
      message: "Searching for properties...",
      type: "info",
      duration: 2000,
    });

    router.push({
      pathname: "/(screens)/Results",
      params: searchParams,
    });
  }; // Render property type grid item
  const renderPropertyTypeItem = (item: PropertyTypeItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.propertyTypeItem,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          borderColor:
            propertyType === item.id
              ? theme.colors.primary[500]
              : isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
          borderWidth: propertyType === item.id ? 2 : 1,
          shadowColor: theme.colors.gray[900],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 2,
          elevation: propertyType === item.id ? 3 : 1,
        },
      ]}
      onPress={() => openPropertyTypeModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.propertyTypeIconContainer}>
        <Ionicons
          name={item.icon as any}
          size={32}
          color={
            propertyType === item.id
              ? theme.colors.primary[500]
              : isDark
              ? theme.colors.gray[400]
              : theme.colors.gray[600]
          }
        />
      </View>
      <Text
        style={[
          styles.propertyTypeText,
          {
            color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            fontWeight: propertyType === item.id ? "600" : "500",
          },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
  // Render recent search item
  const renderRecentSearchItem = (item: RecentSearch) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.recentSearchItem,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[50],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
          shadowColor: theme.colors.gray[900],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 2,
          elevation: 1,
        },
      ]}
      onPress={() => handleRecentSearchSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recentSearchContent}>
        <View
          style={[
            styles.recentSearchIcon,
            {
              backgroundColor: isDark
                ? theme.colors.primary[900]
                : theme.colors.primary[50],
              borderRadius: 20,
              padding: 6,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.primary[500]}
          />
        </View>
        <View style={styles.recentSearchTextContainer}>
          <Text
            style={[
              styles.recentSearchCity,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
                fontWeight: "600",
              },
            ]}
          >
            {item.city}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <Ionicons
              name="calendar-outline"
              size={12}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.recentSearchDetails,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {item.date}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <Ionicons
              name="people-outline"
              size={12}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.recentSearchDetails,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {`${item.guests} ${
                item.guests === 1 ? t("search.guest") : t("search.guests")
              } - ${item.rooms} ${
                item.rooms === 1 ? t("search.room") : t("search.rooms")
              }`}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.recentSearchDelete}
        onPress={() => removeRecentSearch(item.id)}
      >
        <Ionicons
          name="close"
          size={16}
          color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  // Create the content for the FlatList's ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Search Form Card */}
      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
            shadowColor: theme.colors.gray[900],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
          },
        ]}
      >
        {/* Location Input */}
        <TouchableOpacity
          style={[
            styles.searchInput,
            {
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            },
          ]}
          onPress={() => router.push("/(modals)/SearchLocationModal")}
        >
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.primary[900]
                : theme.colors.primary[50],
              borderRadius: 20,
              padding: 6,
              marginRight: spacing.md,
            }}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.searchInputContent}>
            <Text
              style={[
                styles.searchInputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.goingTo")}
            </Text>
            <Text
              style={[
                styles.searchInputValue,
                {
                  color: location
                    ? isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900]
                    : isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[500],
                  fontWeight: location ? "500" : "400",
                },
              ]}
              numberOfLines={1}
            >
              {location || t("search.searchDestination")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
        </TouchableOpacity>
        {/* Dates Input */}
        <TouchableOpacity
          style={[
            styles.searchInput,
            {
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          onPress={() => router.push("/(modals)/SearchDateModal")}
        >
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.primary[900]
                : theme.colors.primary[50],
              borderRadius: 20,
              padding: 6,
              marginRight: spacing.md,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.searchInputContent}>
            <Text
              style={[
                styles.searchInputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.dates")}
            </Text>
            <Text
              style={[
                styles.searchInputValue,
                {
                  color: dates
                    ? isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900]
                    : isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[500],
                  fontWeight: dates ? "500" : "400",
                },
              ]}
              numberOfLines={1}
            >
              {dates || t("search.selectDates")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
        </TouchableOpacity>
        {/* Travelers Input */}
        <TouchableOpacity
          style={[
            styles.searchInput,
            {
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
              borderBottomWidth: 0,
            },
          ]}
          onPress={() => router.push("/(modals)/SearchTravelersModal")}
        >
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.primary[900]
                : theme.colors.primary[50],
              borderRadius: 20,
              padding: 6,
              marginRight: spacing.md,
            }}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.searchInputContent}>
            <Text
              style={[
                styles.searchInputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.travelers")}
            </Text>
            <Text
              style={[
                styles.searchInputValue,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                  fontWeight: "500",
                },
              ]}
              numberOfLines={1}
            >
              {travelers}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
        </TouchableOpacity>{" "}
        {/* Search Button */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor: theme.colors.primary[500],
              // Make the button more prominent when location is selected
              transform: location ? [{ scale: 1.03 }] : [],
              shadowOpacity: location ? 0.25 : 0.1,
              elevation: location ? 5 : 3,
            },
          ]}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>
            {location
              ? t("search.searchNow") || "Search Now"
              : t("search.search") || "Search"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Property Types Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            },
          ]}
        >
          {t("search.propertyTypes")}
        </Text>
        <View style={styles.propertyTypesGrid}>
          {propertyTypes.map(renderPropertyTypeItem)}
        </View>
      </View>
      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.recentSearchesHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("search.recentSearches")}
            </Text>
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text
                style={[styles.clearAll, { color: theme.colors.primary[500] }]}
              >
                {t("search.clearAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentSearchesList}>
            {recentSearches
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(renderRecentSearchItem)}
          </View>
        </View>
      )}
    </>
  );

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

      {/* Header with search bar */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
          ]}
        >
          {t("search.title")}
        </Text>
      </View>

      {/* Using FlatList to avoid VirtualizedList nesting issues */}
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}
        renderItem={() => null}
        ListHeaderComponent={renderHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  searchInputIcon: {
    marginRight: spacing.md,
  },
  searchInputContent: {
    flex: 1,
  },
  searchInputLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  searchInputValue: {
    fontSize: fontSize.md,
  },
  searchButton: {
    padding: spacing.md,
    alignItems: "center",
  },
  searchButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  propertyTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  propertyTypeItem: {
    width: itemWidth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  propertyTypeIconContainer: {
    marginBottom: spacing.sm,
  },
  propertyTypeText: {
    fontSize: fontSize.sm,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  clearAll: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  recentSearchesList: {
    gap: spacing.md,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  recentSearchContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recentSearchIcon: {
    marginRight: spacing.md,
  },
  recentSearchTextContainer: {
    flex: 1,
  },
  recentSearchCity: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  recentSearchDetails: {
    fontSize: fontSize.sm,
  },
  recentSearchDelete: {
    padding: spacing.xs,
  },
});
