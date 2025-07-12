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
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="md"
      paddingHorizontal="lg"
    >
      <Text size="md" weight="medium">
        {label}
      </Text>
      <Container flexDirection="row" alignItems="center">
        <TouchableOpacity
          accessibilityLabel={t("search.decrement") || "Decrease"}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            opacity: value <= minValue ? 0.5 : 1,
          }}
          onPress={onDecrement}
          disabled={value <= minValue}
        >
          <Icon
            name="remove"
            size={iconSize.sm}
            color={
              value <= minValue
                ? isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
                : isDark
                ? theme.colors.gray[300]
                : theme.colors.gray[700]
            }
          />
        </TouchableOpacity>
        <Text
          size="lg"
          weight="semibold"
          style={{ minWidth: 40, textAlign: "center" }}
        >
          {value}
        </Text>
        <TouchableOpacity
          accessibilityLabel={t("search.increment") || "Increase"}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
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
            size={iconSize.sm}
            color={
              value >= maxValue
                ? isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
                : isDark
                ? theme.colors.gray[300]
                : theme.colors.gray[700]
            }
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
          title={t("search.travelers") || "Who's coming?"}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />
        <Container flex={1}>
          {/* Adults Counter */}
          <Counter
            label={t("search.adults") || "Adults"}
            value={adults}
            onIncrement={() => setAdults(Math.min(adults + 1, 10))}
            onDecrement={() => setAdults(Math.max(adults - 1, 1))}
            minValue={1}
          />
          {/* Children Counter */}
          <Counter
            label={t("search.children") || "Children"}
            value={children}
            onIncrement={() => setChildren(Math.min(children + 1, 10))}
            onDecrement={() => setChildren(Math.max(children - 1, 0))}
          />
          {/* Rooms Counter */}
          <Counter
            label={t("search.rooms") || "Rooms"}
            value={rooms}
            onIncrement={() => setRooms(Math.min(rooms + 1, 10))}
            onDecrement={() => setRooms(Math.max(rooms - 1, 1))}
            minValue={1}
          />
          {/* Summary */}
          <Container
            marginHorizontal="lg"
            marginVertical="md"
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
              {totalGuests}&nbsp;
              {totalGuests === 1 ? t("search.guest") : t("search.guests")}
              ,&nbsp;
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
          borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          <Button
            onPress={handleApply}
            title={t("common.apply") || t("search.apply") || "Apply"}
            variant="primary"
          />
        </Container>
      </Container>
    </Modal>
  );
}
