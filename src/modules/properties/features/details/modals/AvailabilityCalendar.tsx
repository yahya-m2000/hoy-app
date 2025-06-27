import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@shared/components/base";
import { OverlayScreen } from "@shared/components/common";
import { Calendar } from "@shared/components";
import { fetchPropertyAvailability } from "@shared/services/api/properties";

interface AvailabilityCalendarScreenProps {
  propertyId?: string;
  onClose?: () => void;
}

const AvailabilityCalendarScreen: React.FC<AvailabilityCalendarScreenProps> = ({
  propertyId,
  onClose,
}) => {
  // Fetch real availability data
  const { data: availability, isLoading } = useQuery({
    queryKey: ["property-availability", propertyId],
    queryFn: () => fetchPropertyAvailability(propertyId || ""),
    enabled: !!propertyId,
  });

  // Convert availability data to calendar format
  const { blockedDates, bookingRanges } = useMemo(() => {
    if (!availability) {
      return { blockedDates: [], bookingRanges: [] };
    }

    const blocked: Date[] = [];
    const ranges: { start: Date; end: Date }[] = [];

    availability.unavailableDates.forEach((unavailable) => {
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
    });

    return { blockedDates: blocked, bookingRanges: ranges };
  }, [availability]);
  return (
    <OverlayScreen
      headerIcon="calendar-outline"
      headerTitle="Check Availability"
      headerSubtitle="View available and booked dates for this property"
      isLoading={isLoading}
      loadingText="Loading availability..."
      infoBoxText="This calendar shows the current availability for this property. Green dates are available for booking, while colored dates are already booked or blocked by the host."
      onClose={onClose}
    >
      {/* Calendar */}
      <Container marginBottom="xl">
        <Calendar
          blockedDates={blockedDates}
          bookingRanges={bookingRanges}
          minDate={undefined} // Allow viewing from current day
          maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          enableRangeSelection={false}
          onDateSelect={undefined}
        />
      </Container>
    </OverlayScreen>
  );
};

export default AvailabilityCalendarScreen;
