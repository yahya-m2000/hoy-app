/**
 * Unified Search Modal Component
 * Handles different types of search inputs in a modular way
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, addDays, differenceInDays } from "date-fns";
// @ts-ignore
import { debounce } from "lodash";

// App context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useSearchForm } from "@features/search/hooks";

// Components
import {
  Button,
  Container,
  Header,
  Text,
  Icon,
  Calendar,
} from "@shared/components";

// Constants
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";
import { COUNTRIES } from "@core/utils/data/countries";

// Types
export type ModalType = "location" | "dates" | "travelers";

interface LocationResult {
  city: string;
  country: string;
  fullName?: string;
  coordinates?: { longitude: number; latitude: number };
}

interface UnifiedSearchModalProps {
  visible: boolean;
  modalType: ModalType;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export default function UnifiedSearchModal({
  visible,
  modalType,
  onClose,
  onComplete,
}: UnifiedSearchModalProps) {
  const { theme, isDark } = useTheme();
  const { searchState, updateSearchState } = useSearchForm();
  const insets = useSafeAreaInsets();

  // Location modal state
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<LocationResult[]>([]);

  // Date modal state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Travelers modal state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Initialize state based on modal type
  useEffect(() => {
    if (visible) {
      switch (modalType) {
        case "location":
          setLocations(getPopularDestinations());
          break;
        case "dates":
          const today = new Date();
          const tomorrow = addDays(today, 1);

          // Safely handle date initialization with validation
          let initialStartDate = format(today, "yyyy-MM-dd");
          let initialEndDate = format(tomorrow, "yyyy-MM-dd");

          // Validate existing dates from search state
          if (searchState?.startDate) {
            const startDateObj = new Date(searchState.startDate);
            if (!isNaN(startDateObj.getTime())) {
              initialStartDate = format(startDateObj, "yyyy-MM-dd");
            }
          }

          if (searchState?.endDate) {
            const endDateObj = new Date(searchState.endDate);
            if (!isNaN(endDateObj.getTime())) {
              initialEndDate = format(endDateObj, "yyyy-MM-dd");
            }
          }

          setStartDate(initialStartDate);
          setEndDate(initialEndDate);
          break;
        case "travelers":
          setAdults(searchState?.adults || 2);
          setChildren(searchState?.children || 0);
          setRooms(searchState?.rooms || 1);
          break;
      }
    }
  }, [visible, modalType, searchState]);

  // Location search utilities using COUNTRIES data
  const searchLocations = async (query: string): Promise<LocationResult[]> => {
    const lower = query.trim().toLowerCase();
    if (!lower) return [];

    const results: LocationResult[] = [];

    // 1. City matches
    COUNTRIES.forEach((c) => {
      c.cities.forEach((city) => {
        if (city.toLowerCase().includes(lower)) {
          results.push({
            city,
            country: c.name,
            fullName: `${city}, ${c.name}`,
          });
        }
      });
    });

    // 2. State matches
    COUNTRIES.forEach((c) => {
      c.states.forEach((state) => {
        if (state.toLowerCase().includes(lower)) {
          results.push({
            city: state,
            country: c.name,
            fullName: `${state}, ${c.name}`,
          });
        }
      });
    });

    // 3. Country matches
    COUNTRIES.forEach((c) => {
      if (c.name.toLowerCase().includes(lower)) {
        results.push({
          city: c.name,
          country: "",
          fullName: c.name,
        });
      }
    });

    // Remove duplicates and limit results
    const unique = Array.from(
      new Map(results.map((r) => [r.fullName, r])).values()
    );
    return unique.slice(0, 20);
  };

  const getPopularDestinations = (): LocationResult[] => {
    return [
      { city: "Paris", country: "France", fullName: "Paris, France" },
      {
        city: "New York",
        country: "United States",
        fullName: "New York, United States",
      },
      { city: "Tokyo", country: "Japan", fullName: "Tokyo, Japan" },
      {
        city: "London",
        country: "United Kingdom",
        fullName: "London, United Kingdom",
      },
      { city: "Sydney", country: "Australia", fullName: "Sydney, Australia" },
    ];
  };

  // Debounced location search
  const performLocationSearch = React.useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setLocations(getPopularDestinations());
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchLocations(query);
        setLocations(
          results.length > 0 ? results : getPopularDestinations().slice(0, 3)
        );
      } catch (error) {
        console.error("Error searching locations:", error);
        setLocations(getPopularDestinations());
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle location selection
  const handleLocationSelect = (location: LocationResult) => {
    const locationString =
      location.fullName || `${location.city}, ${location.country}`;

    updateSearchState({
      location: locationString,
      coordinates: location.coordinates,
    });

    onComplete?.({
      location: locationString,
      coordinates: location.coordinates,
    });
    onClose();
  };

  // Handle date selection
  const handleDateApply = () => {
    const nights = Math.max(
      1,
      differenceInDays(new Date(endDate), new Date(startDate))
    );
    const displayDates = `${format(new Date(startDate), "MMM dd")} - ${format(
      new Date(endDate),
      "MMM dd"
    )}`;

    updateSearchState({
      startDate,
      endDate,
      displayDates,
      nights,
    });

    onComplete?.({ startDate, endDate, nights, displayDates });
    onClose();
  };

  // Handle travelers selection
  const handleTravelersApply = () => {
    const totalGuests = adults + children;
    const displayTravelers = `${totalGuests} ${
      totalGuests === 1 ? t("search.guest") : t("search.guests")
    }, ${rooms} ${rooms === 1 ? t("search.room") : t("search.rooms")}`;

    updateSearchState({
      adults,
      children,
      rooms,
      displayTravelers,
    });

    onComplete?.({ adults, children, rooms, totalGuests, displayTravelers });
    onClose();
  };

  // Counter component for travelers
  const Counter = ({
    label,
    value,
    onIncrement,
    onDecrement,
    minValue = 0,
    maxValue = 10,
  }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    minValue?: number;
    maxValue?: number;
  }) => (
    <Container
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingVertical="lg"
      borderBottomWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[300]}
    >
      <Text variant="body" weight="medium">
        {label}
      </Text>
      <Container
        flexDirection="row"
        alignItems="center"
        style={{ gap: spacing.md }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
            opacity: value <= minValue ? 0.5 : 1,
          }}
          onPress={onDecrement}
          disabled={value <= minValue}
        >
          <Icon name="remove" size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
        <Text
          variant="body"
          weight="semibold"
          style={{ minWidth: 30, textAlign: "center" }}
        >
          {value}
        </Text>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
            opacity: value >= maxValue ? 0.5 : 1,
          }}
          onPress={onIncrement}
          disabled={value >= maxValue}
        >
          <Icon name="add" size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </Container>
    </Container>
  );

  // Get modal title
  const getModalTitle = () => {
    switch (modalType) {
      case "location":
        return t("search.whereToGo") || "Where to go?";
      case "dates":
        return t("search.selectDates") || "Select dates";
      case "travelers":
        return t("search.travelers") || "Travelers";
      default:
        return "";
    }
  };

  // Render location item
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
          variant="body"
          weight="medium"
          style={{ marginBottom: spacing.xs }}
        >
          {item.city}
        </Text>
        <Text variant="caption" color="secondary">
          {item.country}
        </Text>
      </Container>
    </TouchableOpacity>
  );

  // Render modal content based on type
  const renderContent = () => {
    switch (modalType) {
      case "location":
        return (
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
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                }}
                placeholder={
                  t("search.searchDestinations") || "Search destinations..."
                }
                placeholderTextColor={
                  isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                }
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  performLocationSearch(text);
                }}
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
                  variant="caption"
                  color="secondary"
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
                <Text variant="body" weight="semibold">
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
        );

      case "dates":
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const nights = Math.max(1, differenceInDays(endDateObj, startDateObj));
        return (
          <Container flex={1} paddingHorizontal="lg">
            {/* Date selection info */}
            <Container
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              marginTop="lg"
              marginBottom="lg"
            >
              <Container
                flex={1}
                padding="md"
                borderRadius="md"
                alignItems="center"
                borderWidth={1}
                borderColor={
                  isDark ? theme.colors.gray[700] : theme.colors.gray[300]
                }
              >
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginBottom: 4 }}
                >
                  Check In
                </Text>
                <Text variant="body" weight="semibold">
                  {startDate && !isNaN(new Date(startDate).getTime())
                    ? format(new Date(startDate), "E, MMM d")
                    : "--"}
                </Text>
              </Container>
              <Container marginHorizontal="sm">
                <Icon name="arrow-forward" size={iconSize.sm} />
              </Container>
              <Container
                flex={1}
                padding="md"
                borderRadius="md"
                alignItems="center"
              >
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginBottom: 4 }}
                >
                  Check Out
                </Text>
                <Text variant="body" weight="semibold">
                  {endDate && !isNaN(new Date(endDate).getTime())
                    ? format(new Date(endDate), "E, MMM d")
                    : "--"}
                </Text>
              </Container>
            </Container>

            {/* Nights count */}
            <Container alignItems="center" marginBottom="lg">
              <Text variant="body" color="secondary">
                {(() => {
                  if (!startDate || !endDate) return "0 nights";
                  const startDateObj = new Date(startDate);
                  const endDateObj = new Date(endDate);
                  if (
                    isNaN(startDateObj.getTime()) ||
                    isNaN(endDateObj.getTime())
                  ) {
                    return "0 nights";
                  }
                  const nights = Math.max(
                    1,
                    differenceInDays(endDateObj, startDateObj)
                  );
                  return `${nights} ${nights === 1 ? "night" : "nights"}`;
                })()}
              </Text>
            </Container>

            {/* Calendar Component */}
            <Calendar
              initialStartDate={new Date(startDate)}
              initialEndDate={
                endDate && !isNaN(new Date(endDate).getTime())
                  ? new Date(endDate)
                  : undefined
              }
              enableRangeSelection={true}
              showLegend={false}
              onDateSelect={(
                selectedStartDate: Date,
                selectedEndDate?: Date
              ) => {
                setStartDate(format(selectedStartDate, "yyyy-MM-dd"));
                if (selectedEndDate) {
                  setEndDate(format(selectedEndDate, "yyyy-MM-dd"));
                } else {
                  setEndDate("");
                }
              }}
              minDate={new Date()}
            />

            {/* Apply Button */}
            <Container
              paddingHorizontal="xl"
              paddingVertical="lg"
              backgroundColor="background"
              borderTopWidth={1}
              borderColor={theme.border || "rgba(0,0,0,0.1)"}
              style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
            >
              <Button
                onPress={handleDateApply}
                title="Apply"
                variant="primary"
                disabled={!startDate || !endDate}
              />
            </Container>
          </Container>
        );

      case "travelers":
        const totalGuests = adults + children;
        return (
          <Container flex={1} paddingHorizontal="lg">
            {/* Adults Counter */}
            <Counter
              label={t("search.adults")}
              value={adults}
              onIncrement={() => setAdults(Math.min(adults + 1, 10))}
              onDecrement={() => setAdults(Math.max(adults - 1, 1))}
              minValue={1}
            />

            {/* Children Counter */}
            <Counter
              label={t("search.children")}
              value={children}
              onIncrement={() => setChildren(Math.min(children + 1, 10))}
              onDecrement={() => setChildren(Math.max(children - 1, 0))}
            />

            {/* Rooms Counter */}
            <Counter
              label={t("search.rooms")}
              value={rooms}
              onIncrement={() => setRooms(Math.min(rooms + 1, 10))}
              onDecrement={() => setRooms(Math.max(rooms - 1, 1))}
              minValue={1}
            />

            {/* Summary */}
            <Container
              marginTop="lg"
              padding="md"
              borderRadius="md"
              backgroundColor={
                isDark ? theme.colors.gray[800] : theme.colors.gray[100]
              }
            >
              <Text
                variant="body"
                weight="medium"
                style={{ textAlign: "center" }}
              >
                {totalGuests}{" "}
                {totalGuests === 1 ? t("search.guest") : t("search.guests")},{" "}
                {rooms} {rooms === 1 ? t("search.room") : t("search.rooms")}
              </Text>
            </Container>

            {/* Apply Button */}
            <Container
              paddingHorizontal="xl"
              paddingVertical="lg"
              backgroundColor="background"
              borderTopWidth={1}
              borderColor={theme.border || "rgba(0,0,0,0.1)"}
              style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
            >
              <Button
                onPress={handleTravelersApply}
                title="Apply"
                variant="primary"
              />
            </Container>
          </Container>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <Header
          title={getModalTitle()}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />
        {renderContent()}
      </Container>
    </Modal>
  );
}
