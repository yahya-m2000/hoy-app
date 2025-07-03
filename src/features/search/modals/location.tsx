/**
 * Search Location Modal for selecting travel destinations
 * Standalone modal component that doesn't require router navigation
 * Uses MapBox API for real-time location search and geocoding
 */

import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// @ts-ignore
import { debounce } from "lodash";

// App context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useSearchForm } from "@features/search/hooks";

// Components
import { Button, Container, Header, Text, Icon } from "@shared/components";

// Constants
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";

// Types
interface LocationResult {
  city: string;
  country: string;
  fullName?: string;
  coordinates?: { longitude: number; latitude: number };
}

// Placeholder services (TODO: implement actual search services)
const searchLocations = async (query: string): Promise<LocationResult[]> => {
  return [];
};

const getPopularDestinations = (): LocationResult[] => {
  return [
    { city: "Mogadishu", country: "Somalia" },
    { city: "Hargeisa", country: "Somalia" },
    { city: "Bosaso", country: "Somalia" },
  ];
};

interface SearchLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected?: (location: {
    location: string;
    coordinates?: { longitude: number; latitude: number };
  }) => void;
}

export default function SearchLocationModal({
  visible,
  onClose,
  onLocationSelected,
}: SearchLocationModalProps) {
  const { theme, isDark } = useTheme();
  const { updateSearchState } = useSearchForm();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<LocationResult[]>(
    getPopularDestinations()
  );

  // Create a debounced search function with proper cleanup
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

    // Call the callback if provided
    onLocationSelected?.({
      location: locationString,
      coordinates: location.coordinates,
    });

    console.log(
      "Search state updated with location and coordinates, closing modal"
    );

    // Close the modal
    onClose();
  };

  const renderLocationItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
        backgroundColor: "transparent",
      }}
      onPress={() => handleLocationSelect(item)}
    >
      <Container marginRight="md">
        <Icon name="location-outline" size={24} color={theme.colors.primary} />
      </Container>
      <Container flex={1}>
        <Text
          weight="medium"
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          style={{ marginBottom: spacing.xs }}
        >
          {item.city}
        </Text>
        <Text
          size="sm"
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
        >
          {item.country}
        </Text>
      </Container>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <Header
          title={t("search.whereToGo") || "Where to go?"}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />

        <Container flex={1}>
          {/* Search Input */}
          <Container
            flexDirection="row"
            alignItems="center"
            marginHorizontal="lg"
            marginVertical="md"
            paddingHorizontal="md"
            borderRadius="md"
            borderWidth={1}
            backgroundColor={
              isDark ? theme.colors.gray[700] : theme.colors.gray[200]
            }
            borderColor={
              isDark ? theme.colors.gray[600] : theme.colors.gray[300]
            }
            style={{ height: 48 }}
          >
            <Icon
              name="search"
              size={20}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              style={{ marginRight: spacing.sm }}
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: spacing.sm,
                color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
              }}
              placeholder={
                t("search.searchDestinations") || "Search destinations..."
              }
              placeholderTextColor={
                isDark ? theme.colors.gray[400] : theme.colors.gray[500]
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              clearButtonMode="while-editing"
            />
          </Container>

          {/* Loading indicator */}
          {isLoading && (
            <Container
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              padding="lg"
            >
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                size="sm"
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
                style={{ marginLeft: spacing.sm }}
              >
                {t("search.searchingLocations") || "Searching locations..."}
              </Text>
            </Container>
          )}

          {/* Popular destinations header */}
          {!searchQuery && (
            <Container
              paddingHorizontal="lg"
              paddingTop="md"
              paddingBottom="sm"
            >
              <Text
                size="md"
                weight="semibold"
                color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
              >
                {t("search.popularDestinations") || "Popular destinations"}
              </Text>
            </Container>
          )}

          {/* Results List */}
          <FlatList
            data={locations}
            renderItem={renderLocationItem}
            keyExtractor={(item, index) =>
              `${item.city}-${item.country}-${index}`
            }
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          />
        </Container>
      </Container>
    </Modal>
  );
}
