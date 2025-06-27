import React from "react";
import { Container } from "@shared/components/base/Container";
import { OverlayScreen } from "@shared/components/common";
import { Calendar } from "@shared/components";
import { useDateSelection } from "@shared/context/DateSelectionContext";

interface DateSelectionModalProps {
  propertyId?: string;
  onClose?: () => void;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
}

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({
  propertyId,
  onClose,
  onDateSelect,
}) => {
  const { selectDatesForProperty } = useDateSelection();

  // Note: Calendar context automatically clears selection when property changes
  // No need to manually clear on modal open

  const handleDateSelect = (startDate: Date, endDate?: Date) => {
    if (!startDate || !endDate) {
      console.log("Invalid date selection");
      return;
    }

    console.log("Selected dates:", { startDate, endDate, propertyId });

    // Update dates for the specific property if propertyId is provided
    if (propertyId) {
      selectDatesForProperty(propertyId, {
        startDate,
        endDate,
      });
    }

    // Call the callback if provided
    onDateSelect?.(startDate, endDate);

    // Close the modal
    onClose?.();
  };

  return (
    <OverlayScreen
      headerIcon="calendar-outline"
      headerTitle="Select Dates"
      headerSubtitle="Choose your check-in and check-out dates"
      infoBoxText="Select your desired check-in and check-out dates. Available dates are open for booking, while colored dates are already booked or blocked by the host."
      onClose={onClose}
    >
      {/* Calendar */}
      <Container marginBottom="xl">
        <Calendar
          blockedDates={[]} // No hardcoded blocked dates - will use API data via CalendarContext
          bookingRanges={[]} // No hardcoded booking ranges - will use API data via CalendarContext
          minDate={new Date()} // Allow selection from current day
          maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          enableRangeSelection={true}
          onDateSelect={handleDateSelect}
          propertyId={propertyId}
        />
      </Container>
    </OverlayScreen>
  );
};

export default DateSelectionModal;
