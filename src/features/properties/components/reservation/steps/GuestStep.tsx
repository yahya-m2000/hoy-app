/**
 * Guest Step Component for Reservation Flow
 */

import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, Container, Icon } from "@shared/components";
import { GuestSelector } from "../GuestSelector";
import { useTheme } from "@core/hooks/useTheme";

interface GuestStepProps {
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeAdults: (value: number) => void;
  onChangeChildren: (value: number) => void;
  onChangeInfants: (value: number) => void;
  onChangePets: (value: number) => void;
  maxGuests: number;
  formatDate: (date: Date | null) => string;
  calculateNights: () => number;
  onEditDates: () => void;
}

export const GuestStep: React.FC<GuestStepProps> = ({
  startDate,
  endDate,
  adults,
  childrenCount,
  infants,
  pets,
  onChangeAdults,
  onChangeChildren,
  onChangeInfants,
  onChangePets,
  maxGuests,
  formatDate,
  calculateNights,
  onEditDates,
}) => {
  const { theme } = useTheme();
  const [isEditingDates, setIsEditingDates] = useState(false);

  // Create a debounced version of onEditDates to prevent multiple rapid calls
  const handleEditDates = () => {
    if (isEditingDates) return; // Prevent multiple calls

    setIsEditingDates(true);

    // Call the original function after a short delay
    setTimeout(() => {
      onEditDates();
      // Reset the flag after a longer delay to prevent rapid re-clicks
      setTimeout(() => {
        setIsEditingDates(false);
      }, 1000);
    }, 300);
  };

  return (
    <Container style={{ flex: 1 }}>
      {/* Date Summary */}
      <Container marginBottom="lg">
        <TouchableOpacity onPress={handleEditDates} disabled={isEditingDates}>
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="md"
            borderRadius="md"
            backgroundColor="rgba(0, 0, 0, 0.05)"
          >
            <Container style={{ flex: 1 }}>
              <Text
                variant="body"
                weight="medium"
                color={theme.colors.gray[600]}
              >
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : "Select dates"}
              </Text>
              <Text
                variant="caption"
                color={theme.colors.gray[500]}
                style={{ marginTop: 4 }}
              >
                {calculateNights()} nights
              </Text>
            </Container>
            <Icon name="pencil" size={16} color={theme.colors.primary} />
          </Container>
        </TouchableOpacity>
      </Container>

      {/* Guest Selector */}
      <GuestSelector
        adults={adults}
        childrenCount={childrenCount}
        infants={infants}
        pets={pets}
        onChangeAdults={onChangeAdults}
        onChangeChildren={onChangeChildren}
        onChangeInfants={onChangeInfants}
        onChangePets={onChangePets}
        maxGuests={maxGuests}
      />
    </Container>
  );
};

export default GuestStep;
