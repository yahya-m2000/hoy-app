/**
 * Date Step Component for Reservation Flow
 */

import React, { useMemo, useEffect, useState, useRef } from "react";
import { ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Text, Container, Icon, Calendar } from "@shared/components";
import { useTheme } from "@core/hooks/useTheme";
import { useCalendar } from "@features/calendar/hooks/useCalendar";
import { PropertyDetailsService } from "@core/api/services";

interface DateStepProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelectRange: (start: Date, end: Date) => void;
  propertyId?: string;
  unitId?: string;
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  formatDate: (date: Date | null) => string;
  onAvailabilityChange?: (
    isAvailable: boolean | null,
    isChecking: boolean
  ) => void;
  onForceRefresh?: () => void;
}

export const DateStep: React.FC<DateStepProps> = ({
  startDate,
  endDate,
  onSelectRange,
  propertyId,
  unitId,
  isCheckingAvailability,
  isAvailable,
  formatDate,
  onAvailabilityChange,
  onForceRefresh,
}) => {
  const { theme, isDark } = useTheme();
  const calendarContext = useCalendar();

  // Validate propertyId before making API calls
  const isValidPropertyId = Boolean(propertyId && propertyId.length > 0);

  // Ref to track if we've already refreshed
  const hasRefreshed = useRef(false);

  // Fetch real availability data if propertyId is provided and valid
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["property-availability", propertyId],
    queryFn: () => PropertyDetailsService.getPropertyAvailability(propertyId!),
    enabled: Boolean(isValidPropertyId),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Force refresh booked dates when component mounts or propertyId changes
  useEffect(() => {
    if (calendarContext && isValidPropertyId) {
      // Set the property ID to trigger booked dates query
      calendarContext.setPropertyId(propertyId!);

      // Set a small timeout to ensure the data is refreshed after any modal animations
      const refreshTimer = setTimeout(() => {
        calendarContext.setPropertyId(propertyId!);
      }, 300);

      return () => clearTimeout(refreshTimer);
    }
  }, [propertyId, calendarContext, isValidPropertyId]);

  // Sync with calendar context and check availability when dates change
  useEffect(() => {
    if (calendarContext && startDate && endDate) {
      // Update context with current selection
      if (
        startDate !== calendarContext.selectedDates[0] ||
        endDate !== calendarContext.selectedDates[1]
      ) {
        calendarContext.setSelectedDates([startDate, endDate]);
      }

      // Check availability for the selected dates
      if (isValidPropertyId) {
        calendarContext.checkDateAvailability({
          propertyId: propertyId!,
          checkIn: startDate.toISOString().split("T")[0],
          checkOut: endDate.toISOString().split("T")[0],
          guestCount: 1, // Default to 1 guest, can be updated later
          unitId: unitId,
        });
      }
    }
  }, [
    startDate,
    endDate,
    calendarContext,
    propertyId,
    unitId,
    isValidPropertyId,
  ]);

  // Sync availability status with parent component
  useEffect(() => {
    if (onAvailabilityChange && calendarContext) {
      const {
        isCheckingAvailability: contextChecking,
        isAvailable: contextAvailable,
      } = calendarContext;

      if (contextChecking) {
        onAvailabilityChange(null, true);
      } else {
        onAvailabilityChange(contextAvailable, false);
      }
    }
  }, [calendarContext, onAvailabilityChange]);

  // Convert availability data to calendar format
  const { blockedDates, bookingRanges } = useMemo(() => {
    if (!availability) {
      // Fallback mock data when no API data is available
      return {
        blockedDates: [
          new Date(2024, 11, 15),
          new Date(2024, 11, 16),
          new Date(2024, 11, 25),
          new Date(2024, 11, 26),
          new Date(2025, 0, 1),
        ],
        bookingRanges: [
          {
            start: new Date(2024, 11, 10),
            end: new Date(2024, 11, 12),
          },
          {
            start: new Date(2024, 11, 20),
            end: new Date(2024, 11, 22),
          },
        ],
      };
    }

    const blocked: Date[] = [];
    const ranges: { start: Date; end: Date }[] = [];

    // Check if availability has the expected structure
    if (availability && availability.unavailableDates) {
      availability.unavailableDates.forEach(
        (unavailable: {
          startDate: string | Date;
          endDate: string | Date;
          reason: string;
        }) => {
          const start = new Date(unavailable.startDate);
          const end = new Date(unavailable.endDate);

          if (unavailable.reason === "booked") {
            ranges.push({ start, end });
          } else {
            // For blocked dates, add each day individually
            const currentDate = new Date(start);
            while (currentDate <= end) {
              blocked.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        }
      );
    }

    return { blockedDates: blocked, bookingRanges: ranges };
  }, [availability]);

  const handleDateSelect = (startDate: Date, endDate?: Date) => {
    if (startDate && endDate) {
      onSelectRange(startDate, endDate);
    }
  };

  // Add a unique key that changes whenever the component is remounted
  const [calendarKey, setCalendarKey] = useState(Date.now().toString());

  // Reset calendar key when propertyId changes to force remount
  useEffect(() => {
    setCalendarKey(Date.now().toString());
  }, [propertyId]);

  // Call onForceRefresh when component mounts
  useEffect(() => {
    if (onForceRefresh && !hasRefreshed.current) {
      onForceRefresh();
      hasRefreshed.current = true;
    }
  }, [onForceRefresh]);

  // Refresh data when component mounts or property changes
  useEffect(() => {
    // Set property ID to trigger data refresh
    if (calendarContext && isValidPropertyId) {
      calendarContext.setPropertyId(propertyId!);
    }
  }, [calendarContext, isValidPropertyId, propertyId]);

  return (
    <Container style={{ flex: 1 }}>
      <Container
        marginBottom="lg"
        padding="md"
        borderRadius="md"
        backgroundColor="rgba(0, 0, 0, 0.05)"
      >
        <Text
          variant="body"
          color={isDark ? theme.white : theme.colors.gray[900]}
        >
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "No dates selected yet"}
        </Text>
      </Container>

      {/* Loading state for availability data */}
      {isLoadingAvailability && (
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          paddingVertical="md"
          marginBottom="lg"
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            variant="caption"
            color={theme.colors.gray[600]}
            style={{ marginLeft: 8 }}
          >
            Loading availability...
          </Text>
        </Container>
      )}

      {/* Calendar */}
      <Container marginBottom="lg">
        <Calendar
          key={calendarKey}
          blockedDates={blockedDates}
          bookingRanges={bookingRanges}
          minDate={undefined} // Allow selection from current day
          maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          enableRangeSelection={true}
          onDateSelect={handleDateSelect}
          propertyId={propertyId}
          initialStartDate={startDate || undefined}
          initialEndDate={endDate || undefined}
        />
      </Container>

      {/* Use calendar context availability status */}
      {(isCheckingAvailability || calendarContext?.isCheckingAvailability) && (
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          paddingVertical="md"
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            variant="caption"
            color={theme.colors.gray[600]}
            style={{ marginLeft: 8 }}
          >
            Checking availability...
          </Text>
        </Container>
      )}

      {!(isCheckingAvailability || calendarContext?.isCheckingAvailability) &&
        (isAvailable === false || calendarContext?.isAvailable === false) && (
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            paddingVertical="md"
            paddingHorizontal="lg"
            borderRadius="md"
            borderWidth={1}
            marginTop="md"
            backgroundColor={
              isDark ? theme.colors.error[900] : theme.colors.error[50]
            }
            borderColor={theme.colors.error[500]}
          >
            <Icon
              name="alert-circle-outline"
              size={20}
              color={theme.colors.error[500]}
            />
            <Text
              variant="caption"
              color={theme.colors.error[500]}
              style={{ marginLeft: 8 }}
            >
              Selected dates are not available
            </Text>
          </Container>
        )}
    </Container>
  );
};

export default DateStep;
