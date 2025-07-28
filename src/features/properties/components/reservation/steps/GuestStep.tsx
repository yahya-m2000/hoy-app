/**
 * Guest Step Component for Reservation Flow
 * Modern, clean design with improved visual hierarchy and user experience
 */

import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, Container, Icon } from "@shared/components";
import { GuestSelector } from "../GuestSelector";
import { useTheme } from "@core/hooks/useTheme";
import { useTranslation } from "react-i18next";

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
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
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
      {/* Header Section */}
      <Container marginBottom="xl">
        <Text
          variant="h4"
          weight="bold"
          color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
          style={{ marginBottom: 8 }}
        >
          {t("features.booking.flow.whoIsComing", "Who's coming?")}
        </Text>
        <Text
          variant="body"
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
        >
          {t(
            "features.booking.flow.selectGuestCount",
            "Select the number of guests for your stay"
          )}
        </Text>
      </Container>

      {/* Date Summary Card */}
      <Container marginBottom="xl">
        <Container marginBottom="sm">
          <Text
            variant="caption"
            weight="semibold"
            style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {t("features.booking.flow.selectedDates", "Selected Dates")}
          </Text>
        </Container>

        <TouchableOpacity onPress={handleEditDates} disabled={isEditingDates}>
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Container style={{ flex: 1 }}>
              <Text
                variant="body"
                weight="semibold"
                color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
              >
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : t("features.booking.flow.selectDates", "Select dates")}
              </Text>
              <Container flexDirection="row" alignItems="center" marginTop="xs">
                <Icon
                  name="calendar"
                  size={14}
                  color={
                    isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                  }
                />
                <Text
                  variant="caption"
                  color={
                    isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                  }
                  style={{ marginLeft: 6 }}
                >
                  {calculateNights()}{" "}
                  {t("features.booking.flow.nights", "nights")}
                </Text>
              </Container>
            </Container>
            <Container>
              <Icon name="pencil" size={16} />
            </Container>
          </Container>
        </TouchableOpacity>
      </Container>

      {/* Guest Selector with improved styling */}
      <Container>
        <Container marginBottom="lg">
          <Text
            variant="h6"
            weight="semibold"
            color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          >
            {t("features.booking.flow.guestInformation", "Guest Information")}
          </Text>
          <Text
            variant="caption"
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
            style={{ marginTop: 4 }}
          >
            {t("features.booking.flow.maxGuests", "Maximum")} {maxGuests}{" "}
            {t("features.booking.flow.guests", "guests")}
          </Text>
        </Container>

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
    </Container>
  );
};

export default GuestStep;
