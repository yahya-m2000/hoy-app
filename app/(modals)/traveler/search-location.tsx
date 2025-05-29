/**
 * Search Location Modal for selecting travel destinations
 * Uses MapBox API for real-time location search and geocoding
 * Includes popular destinations and recent search suggestions
 */

// React Native core
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";

// Expo and third-party libraries
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
// @ts-ignore
import { debounce } from "lodash";

// App context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useSearchForm } from "@common/hooks/useSearchForm";

// Components
import BottomSheetModal from "@common/components/BottomSheetModal";

// Services
import {
  searchLocations,
  getPopularDestinations,
  LocationResult,
} from "@common/services/geocodingService";

// Constants
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

export default function SearchLocationModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { updateSearchState } = useSearchForm();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<LocationResult[]>(
    getPopularDestinations()
  ); // Create a debounced search function with proper cleanup
  const performSearch = React.useCallback((query: string) => {
    const searchFn = async () => {
      if (!query.trim()) {
        setLocations(getPopularDestinations());
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Performing location search for: "${query}"`);
        const results = await searchLocations(query);
        console.log(`Got ${results.length} location results`);

        if (results.length === 0) {
          // If no results, try with a more general search
          console.log("No results found, trying with more general search");
          const generalResults = await searchLocations(query.split(" ")[0]);
          if (generalResults.length > 0) {
            setLocations(generalResults);
          } else {
            // If still no results, fallback to popular destinations
            setLocations(getPopularDestinations().slice(0, 3));
          }
        } else {
          setLocations(results);
        }
      } catch (error) {
        console.error("Error searching locations:", error);
        // Fallback to popular destinations if search fails
        setLocations(getPopularDestinations());
      } finally {
        setIsLoading(false);
      }
    };

    // Use debounce to prevent too many API calls
    debounce(searchFn, 500)();
  }, []);
  // Effect to trigger search when query changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setLocations(getPopularDestinations());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Create a timeout to avoid too many API calls
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, performSearch]);
  const handleLocationSelect = (location: LocationResult) => {
    const locationString =
      location.fullName || `${location.city}, ${location.country}`;

    console.log(`Selected location: ${locationString}`);
    console.log("Location coordinates:", location.coordinates);

    // Update centralized search state with location info including coordinates
    updateSearchState({
      location: locationString,
      coordinates: location.coordinates,
    });

    console.log(
      "Search state updated with location and coordinates, returning to search form"
    );

    // Only go back to dismiss the modal (return to search form)
    // This allows the user to fill in other search parameters
    router.back();
  };

  const renderLocationItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        {
          backgroundColor: isDark ? "transparent" : "transparent",
          borderBottomColor: isDark
            ? theme.colors.grayPalette[700]
            : theme.colors.grayPalette[200],
        },
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        <Ionicons
          name="location-outline"
          size={24}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.locationContent}>
        <Text
          style={[
            styles.locationCity,
            {
              color: isDark
                ? theme.colors.grayPalette[100]
                : theme.colors.grayPalette[900],
            },
          ]}
        >
          {item.city}
        </Text>
        <Text
          style={[
            styles.locationCountry,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
        >
          {item.country}
        </Text>
      </View>
    </TouchableOpacity>
  );
  // Content for the modal
  const modalContent = (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
            borderColor: isDark
              ? theme.colors.gray[600]
              : theme.colors.gray[300],
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: isDark
                ? theme.colors.gray[50]
                : theme.colors.grayPalette[900],
            },
          ]}
          placeholder={t("search.searchDestination")}
          placeholderTextColor={
            isDark ? theme.colors.gray[500] : theme.colors.gray[500]
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? theme.colors.gray[500] : theme.colors.gray[500]}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* Popular Destinations Section Header */}
      {searchQuery.length === 0 && (
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme.colors.gray[300]
                  : theme.colors.grayPalette[700],
              },
            ]}
          >
            {t("search.popularDestinations")}{" "}
          </Text>
        </View>
      )}
      {/* Loading Indicator or FlatList */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={48}
                color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
              />
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("search.noDestinationsFound")}
              </Text>
            </View>
          }
          // These settings help optimize performance
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          style={[styles.list, { paddingBottom: 80 }]}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );

  return (
    <BottomSheetModal
      title={t("search.destination")}
      showSaveButton={false}
      fullHeight
    >
      {modalContent}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    padding: spacing.xs,
    height: "100%",
  },
  clearButton: {
    padding: spacing.xs,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  locationIcon: {
    marginRight: spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationCity: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  locationCountry: {
    fontSize: fontSize.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
