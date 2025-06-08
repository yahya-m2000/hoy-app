/**
 * Search Travelers Modal for selecting guests and rooms
 * Allows users to specify the number of adults, children, and rooms for their booking
 */

import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

// Context and hooks
import { useTheme } from "@shared/context";
import { useTranslation } from "react-i18next";
import { useSearchForm } from "@shared/hooks";
// Components
import { BottomSheetModal } from "@shared/components";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

export default function SearchTravelersModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { searchState, updateSearchState } = useSearchForm();

  // Prioritize values from our centralized state, fallback to URL params, then defaults
  const initialAdults =
    searchState?.adults ||
    (typeof params.adults === "string" ? parseInt(params.adults, 10) : 2);

  const initialChildren =
    searchState?.children ||
    (typeof params.children === "string" ? parseInt(params.children, 10) : 0);

  const initialRooms =
    searchState?.rooms ||
    (typeof params.rooms === "string" ? parseInt(params.rooms, 10) : 1);

  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);

  const totalGuests = adults + children;
  const handleApply = () => {
    // Format the display text
    const displayTravelers = `${totalGuests} ${
      totalGuests === 1 ? t("search.guest") : t("search.guests")
    }, ${rooms} ${rooms === 1 ? t("search.room") : t("search.rooms")}`;

    // Update our centralized search state
    updateSearchState({
      adults,
      children,
      rooms,
      displayTravelers,
    });

    // First go back to dismiss the modal properly
    router.back();

    // Then use setTimeout to ensure the modal is fully dismissed before navigating
    setTimeout(() => {
      router.replace({
        pathname: "/traveler/search",
        params: {
          adults: adults.toString(),
          children: children.toString(),
          rooms: rooms.toString(),
          totalGuests: totalGuests.toString(),
          displayTravelers,
        },
      });
    }, 100);
  };

  // Counter component for consistent UI
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
    <View style={styles.counterContainer}>
      <Text
        style={[
          styles.counterLabel,
          {
            color: isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {label}
      </Text>

      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[200],
              opacity: value <= minValue ? 0.5 : 1,
            },
          ]}
          onPress={onDecrement}
          disabled={value <= minValue}
        >
          <Ionicons
            name="remove"
            size={20}
            color={
              isDark ? theme.colors.gray[300] : theme.colors.grayPalette[700]
            }
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.counterValue,
            {
              color: isDark
                ? theme.colors.grayPalette[100]
                : theme.colors.grayPalette[900],
            },
          ]}
        >
          {value}
        </Text>

        <TouchableOpacity
          style={[
            styles.counterButton,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[200],
              opacity: value >= maxValue ? 0.5 : 1,
            },
          ]}
          onPress={onIncrement}
          disabled={value >= maxValue}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              isDark ? theme.colors.gray[300] : theme.colors.grayPalette[700]
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BottomSheetModal
      title={t("search.travelers")}
      saveText={t("search.apply")}
      onSave={handleApply}
    >
      <View style={styles.container}>
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
        <View
          style={[
            styles.summaryContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.grayPalette[100],
              borderColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.summaryText,
              {
                color: isDark
                  ? theme.colors.grayPalette[100]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            {`${totalGuests} ${
              totalGuests === 1 ? t("search.guest") : t("search.guests")
            }, ${rooms} ${rooms === 1 ? t("search.room") : t("search.rooms")}`}
          </Text>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  counterLabel: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    width: 40,
    textAlign: "center",
  },
  summaryContainer: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    textAlign: "center",
  },
});
