/**
 * Search Date Modal for selecting check-in and check-out dates
 * Standalone modal component that doesn't require router navigation
 */

import React, { useState } from "react";
import { Modal } from "react-native";
import { format, addDays, differenceInDays } from "date-fns";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// App context
import { useTheme } from "@core/hooks/useTheme";

// App components
import {
  Calendar,
  Button,
  Container,
  Header,
  Text,
  Icon,
} from "@shared/components";

// App hooks
import { useSearchForm } from "@features/search/hooks";

// App constants
import { iconSize } from "@core/design";
import { t } from "i18next";

interface SearchDateModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onDatesSelected?: (dates: {
    startDate: string;
    endDate: string;
    nights: number;
    displayDates: string;
  }) => void;
}

export default function SearchDateModal({
  visible,
  onClose,
  propertyId,
  initialStartDate,
  initialEndDate,
  onDatesSelected,
}: SearchDateModalProps) {
  const { theme, isDark } = useTheme();
  const { searchState, updateSearchState } = useSearchForm();
  const insets = useSafeAreaInsets();

  // Check if this is for a specific property
  const isPropertyContext = !!propertyId;

  // Format today and tomorrow dates
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Use provided initial dates, fallback to search state, then to defaults
  const defaultStartDate =
    initialStartDate ||
    (searchState.startDate && typeof searchState.startDate === "string"
      ? searchState.startDate
      : searchState.startDate
      ? format(new Date(searchState.startDate), "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd"));

  const defaultEndDate =
    initialEndDate ||
    (searchState.endDate && typeof searchState.endDate === "string"
      ? searchState.endDate
      : searchState.endDate
      ? format(new Date(searchState.endDate), "yyyy-MM-dd")
      : format(tomorrow, "yyyy-MM-dd"));

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Calculate number of nights – guard against invalid dates when the user has
  // only selected a start date but not an end date yet. If either date string
  // is empty/invalid we fall back to 0 nights to prevent a RangeError from
  // being thrown inside `differenceInDays`.
  const nights = React.useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    return Math.max(1, differenceInDays(end, start));
  }, [startDate, endDate]);

  const handleApply = () => {
    // Format the dates for display
    const formattedStart = format(new Date(startDate), "MMM dd");
    const formattedEnd = format(new Date(endDate), "MMM dd");
    const displayDates = `${formattedStart} - ${formattedEnd}`;

    // Always update search state (removed property-specific logic)
    updateSearchState({
      startDate,
      endDate,
      displayDates,
      nights,
    });

    // Call the callback if provided
    onDatesSelected?.({
      startDate,
      endDate,
      nights,
      displayDates,
    });

    // Close the modal
    onClose();
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
          title={t("search.selectDates") || "Select dates"}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />

        <Container flex={1} paddingHorizontal="lg">
          {/* Date selection info */}
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginTop="lg"
            marginBottom="lg"
          >
            <Container flex={1} alignItems="center">
              <Text variant="caption" style={{ marginBottom: 4 }}>
                {t("search.checkIn") || "Check In"}
              </Text>
              <Text variant="body" weight="semibold">
                {startDate && !isNaN(new Date(startDate).getTime())
                  ? format(new Date(startDate), "E, MMM d")
                  : t("common.notSelected") || "--"}
              </Text>
            </Container>
            <Container marginHorizontal="sm">
              <Icon name="chevron-forward" size={iconSize.xs} />
            </Container>
            <Container flex={1} alignItems="center">
              <Text variant="caption" style={{ marginBottom: 4 }}>
                {t("search.checkOut") || "Check Out"}
              </Text>
              <Text
                variant="body"
                weight="semibold"
                color={isDark ? "primary" : "primary"}
              >
                {endDate && !isNaN(new Date(endDate).getTime())
                  ? format(new Date(endDate), "E, MMM d")
                  : t("common.notSelected") || "--"}
              </Text>
            </Container>
          </Container>

          {/* Nights count */}
          <Container alignItems="center" marginBottom="lg">
            <Text variant="body">
              {nights}{" "}
              {nights === 1
                ? t("search.night") || "night"
                : t("search.nights") || "nights"}
            </Text>
          </Container>

          {/* Calendar Component */}
          <Calendar
            initialStartDate={new Date(startDate)}
            initialEndDate={endDate ? new Date(endDate) : undefined}
            enableRangeSelection={true}
            showLegend={false}
            onDateSelect={(selectedStartDate: Date, selectedEndDate?: Date) => {
              setStartDate(format(selectedStartDate, "yyyy-MM-dd"));
              if (selectedEndDate) {
                setEndDate(format(selectedEndDate, "yyyy-MM-dd"));
              } else {
                setEndDate("");
              }
            }}
            minDate={today}
          />
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
            title={t("search.apply") || "Apply"}
            variant="primary"
            disabled={!startDate || !endDate}
          />
        </Container>
      </Container>
    </Modal>
  );
}
