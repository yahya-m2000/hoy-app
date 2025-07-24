/**
 * Reservation Screen for Property Bookings
 * Step-based reservation flow with guests, payment, and confirmation
 * Uses Screen component with modal header and base components
 *
 * @module @features/properties/components/reservation/modals/ReservationModal
 */

import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

// Shared components
import { Screen, Container, Text } from "@shared/components";

// Step navigation tab
import { StepNavigationTab } from "../StepNavigationTab";

// Modular imports
import { useReservationState } from "../hooks";
import {
  formatDate,
  calculateNights,
  canProceedToNextStep,
  getModalTitle,
} from "../utils";
import { ReservationStepRenderer } from "../components";
import type { ReservationModalProps } from "../../../types/reservation.types";
import { RESERVATION_STEPS, BUTTON_TEXTS, ERROR_MESSAGES } from "../constants";

// Import existing DateSelectionModal
import DateSelectionModal from "../../../modals/modals/DateSelectionModal";

export default function ReservationModal({
  onClose,
  property,
  currentTabContext = "properties",
  unit,
  initialStartDate,
  initialEndDate,
}: ReservationModalProps) {
  const { t } = useTranslation();

  // Use the custom hook for state management
  const [state, actions] = useReservationState(
    property,
    unit,
    onClose,
    initialStartDate,
    initialEndDate,
    currentTabContext
  );

  const {
    step,
    startDate,
    endDate,
    adults,
    childrenCount,
    infants,
    pets,
    selectedPaymentMethod,
    isBooking,
    isCheckingAvailability,
    isAvailable,
  } = state;

  const {
    nextStep,
    prevStep,
    handleDateSelection,
    handleAvailabilityChange,
    handlePaymentMethodChange,
    handleBookingConfirmation,
    setAdults,
    setChildrenCount,
    setInfants,
    setPets,
    setStep,
  } = actions;

  // State for date selection modal
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);

  // Utility functions
  const formatDateForDisplay = (date: Date | null) => formatDate(date);
  const calculateNightsForDisplay = () => calculateNights(startDate, endDate);

  // Check if current step can proceed
  const canProceed = canProceedToNextStep(
    step,
    startDate,
    endDate,
    isAvailable,
    adults,
    selectedPaymentMethod
  );

  // Get modal title based on current step
  const modalTitle = getModalTitle(step, t);

  // Handle date editing from GuestStep
  const handleEditDates = () => {
    setIsDateModalVisible(true);
  };

  // Handle date selection from modal
  const handleDateSelectionFromModal = (start: Date, end: Date) => {
    handleDateSelection(start, end);
    setIsDateModalVisible(false);
  };

  if (!property) {
    return (
      <Screen
        header={{
          variant: "solid",
          title: "Error",
          left: {
            icon: "close",
            onPress: onClose,
          },
        }}
      >
        <Container padding="lg">
          <Text style={{ textAlign: "center" }}>
            {ERROR_MESSAGES.MISSING_PROPERTY}
          </Text>
        </Container>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen
        header={{
          variant: "solid",
          left: {
            icon: "close",
            onPress: onClose,
          },
          showDivider: false,
        }}
        scrollable
        style={{ paddingBottom: 100 }} // Add space for fixed footer
      >
        <Container>
          <ReservationStepRenderer
            step={step}
            startDate={startDate}
            endDate={endDate}
            adults={adults}
            childrenCount={childrenCount}
            infants={infants}
            pets={pets}
            selectedPaymentMethod={selectedPaymentMethod}
            property={property}
            unit={unit}
            isCheckingAvailability={isCheckingAvailability}
            isAvailable={isAvailable}
            onEditDates={handleEditDates}
            onEditGuests={() => setStep(RESERVATION_STEPS.GUEST_DETAILS)}
            formatDate={formatDateForDisplay}
            calculateNights={calculateNightsForDisplay}
            onAvailabilityChange={handleAvailabilityChange}
            onSelectRange={handleDateSelection}
            onChangeAdults={setAdults}
            onChangeChildren={setChildrenCount}
            onChangeInfants={setInfants}
            onChangePets={setPets}
            onSelectPaymentMethod={handlePaymentMethodChange}
          />
        </Container>
      </Screen>

      {/* Fixed bottom footer */}
      <Container
        backgroundColor="surface"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        borderTopLeftRadius="lg"
        borderTopRightRadius="lg"
      >
        <StepNavigationTab
          showBackButton={step > 1}
          onBackPress={prevStep}
          nextButtonTitle={
            step === RESERVATION_STEPS.CONFIRMATION
              ? BUTTON_TEXTS.CONFIRM_RESERVATION
              : BUTTON_TEXTS.NEXT
          }
          onNextPress={() => {
            if (step === RESERVATION_STEPS.CONFIRMATION) {
              handleBookingConfirmation();
            } else {
              nextStep();
            }
          }}
          nextButtonDisabled={!canProceed || isBooking}
          nextButtonLoading={isBooking}
          spacing={24}
        />
      </Container>
    </View>
  );
}
