/**
 * Search Travelers Modal for selecting guests and rooms
 * Standalone modal component that doesn't require router navigation
 */

import React, { useState } from "react";
import { TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useSearchForm } from "@features/search/hooks";

// Components
import { Button, Container, Text, Header, Icon } from "@shared/components";

// Constants
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";

interface SearchTravelersModalProps {
  visible: boolean;
  onClose: () => void;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
  onTravelersSelected?: (travelers: {
    adults: number;
    children: number;
    rooms: number;
    totalGuests: number;
    displayTravelers: string;
  }) => void;
}

export default function SearchTravelersModal({
  visible,
  onClose,
  initialAdults,
  initialChildren,
  initialRooms,
  onTravelersSelected,
}: SearchTravelersModalProps) {
  const { theme, isDark } = useTheme();
  const { searchState, updateSearchState } = useSearchForm();
  const insets = useSafeAreaInsets();

  // Use provided initial values, fallback to search state, then defaults
  const defaultAdults = initialAdults || searchState?.adults || 2;
  const defaultChildren = initialChildren || searchState?.children || 0;
  const defaultRooms = initialRooms || searchState?.rooms || 1;

  const [adults, setAdults] = useState(defaultAdults);
  const [children, setChildren] = useState(defaultChildren);
  const [rooms, setRooms] = useState(defaultRooms);

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

    // Call the callback if provided
    onTravelersSelected?.({
      adults,
      children,
      rooms,
      totalGuests,
      displayTravelers,
    });

    // Close the modal
    onClose();
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
    <Container
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingVertical="lg"
      borderBottomWidth={1}
      borderColor="rgba(0,0,0,0.1)"
    >
      <Text
        size="md"
        weight="medium"
        color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
      >
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
          <Icon
            name="remove"
            size={20}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>

        <Text
          size="lg"
          weight="semibold"
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          style={{
            minWidth: 30,
            textAlign: "center",
          }}
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
          <Icon
            name="add"
            size={20}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>
      </Container>
    </Container>
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
          title={t("search.travelers")}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />

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
              size="md"
              weight="medium"
              color={isDark ? theme.colors.gray[200] : theme.colors.gray[700]}
              style={{ textAlign: "center" }}
            >
              {totalGuests}{" "}
              {totalGuests === 1 ? t("search.guest") : t("search.guests")},{" "}
              {rooms} {rooms === 1 ? t("search.room") : t("search.rooms")}
            </Text>
          </Container>
        </Container>

        {/* Fixed bottom button */}
        <Container
          paddingHorizontal="xl"
          paddingVertical="lg"
          backgroundColor="background"
          borderTopWidth={1}
          borderColor={theme.border || "rgba(0,0,0,0.1)"}
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          <Button
            onPress={handleApply}
            title={t("search.apply")}
            variant="primary"
          />
        </Container>
      </Container>
    </Modal>
  );
}
