/**
 * Reservation Screen for Property Bookings
 * Step-based reservation flow with dates, guests, payment, and confirmation
 * Uses Screen component with modal header and base components
 */

import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";

// Context and hooks
import { useToast } from "@shared/context/ToastContext";
import { useTranslation } from "react-i18next";

// Shared components
import { Screen, Container, Text } from "@shared/components/base";

// Booking service
import { createBooking } from "@modules/booking";
import type { BookingData } from "@shared/types/booking";

// Step components

import {
  StepNavigationTab,
  DateStep,
  GuestStep,
  PaymentStep,
  ConfirmationStep,
} from "../components";

// Types
import type { PropertyType } from "@shared/types/property";

// Hooks
import { useCurrentUser } from "@shared/hooks/useUser";

interface ReservationModalProps {
  onClose: () => void;
  property: PropertyType | null;
  currentTabContext?: string;
  unit?: any;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function ReservationModal({
  onClose,
  property,
  currentTabContext = "properties",
  unit,
  initialStartDate,
  initialEndDate,
}: ReservationModalProps) {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { showToast } = useToast();

  // Get the correct confirmation route based on current tab context
  const getConfirmationRoute = () => {
    switch (currentTabContext) {
      case "home":
        return "/(tabs)/traveler/home/property/confirmation";
      case "search":
        return "/(tabs)/traveler/search/property/confirmation";
      case "wishlist":
        return "/(tabs)/traveler/wishlist/property/confirmation";
      case "bookings":
        return "/(tabs)/traveler/bookings/property/confirmation";
      case "properties":
        return "/(tabs)/traveler/properties/property/confirmation";
      default:
        return "/(tabs)/traveler/properties/property/confirmation";
    }
  };

  // Check if we have initial dates
  const hasInitialDates = Boolean(initialStartDate && initialEndDate);

  // State management
  const [step, setStep] = useState(hasInitialDates ? 2 : 1);
  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate || null
  );
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  const handlePaymentMethodChange = (method: any) => {
    setSelectedPaymentMethod(method);
  };
  const [isBooking, setIsBooking] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(
    hasInitialDates ? true : null
  );
  const [priceDetails] = useState<any>(null);

  // Property price handling
  const propertyPrice = unit?.price || property?.price || 0;
  const safePropertyPrice =
    typeof propertyPrice === "number" && !isNaN(propertyPrice)
      ? propertyPrice
      : typeof propertyPrice === "object" && propertyPrice?.amount
      ? propertyPrice.amount
      : 0;

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    try {
      return format(date, "EEE, MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Calculate nights
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    try {
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(1, daysDiff);
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  // Handle date selection
  const handleDateSelection = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Step navigation
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Handle availability status updates from DateStep
  const handleAvailabilityChange = (
    available: boolean | null,
    checking: boolean
  ) => {
    setIsAvailable(available);
    setIsCheckingAvailability(checking);
  };

  // Check if current step can proceed
  const canProceed = () => {
    const result = (() => {
      switch (step) {
        case 1:
          return startDate && endDate && isAvailable;
        case 2:
          return adults > 0;
        case 3:
          return selectedPaymentMethod;
        case 4:
          return true;
        default:
          return false;
      }
    })();

    return result;
  };

  // Get modal title based on current step
  const getModalTitle = () => {
    switch (step) {
      case 1:
        return t("reservation.selectDates");
      case 2:
        return t("reservation.guestDetails");
      case 3:
        return t("reservation.paymentMethod");
      case 4:
        return t("reservation.confirmReservation");
      default:
        return t("reservation.reservation");
    }
  };

  // Handle booking confirmation
  const handleBookingConfirmation = async () => {
    if (!property?._id || !startDate || !endDate) {
      showToast({
        type: "error",
        message: "Missing required booking information",
      });
      return;
    }

    setIsBooking(true);
    try {
      // Only include paymentId if it looks like a valid MongoDB ObjectId (24 hex chars)
      const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
      const paymentId =
        selectedPaymentMethod?.id && isValidObjectId(selectedPaymentMethod.id)
          ? selectedPaymentMethod.id
          : undefined;

      // Prepare booking data using the real API structure
      const bookingData: BookingData = {
        propertyId: property._id,
        unitId: unit?._id || property._id,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        guestCount: adults + childrenCount,
        guests: {
          adults,
          children: childrenCount,
          infants,
          pets,
        },
        totalPrice:
          priceDetails?.totalPrice || safePropertyPrice * calculateNights(),
        contactInfo: {
          // Get user information from current user data
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Guest",
          email: currentUser?.email || "",
          phone: currentUser?.phoneNumber || "",
        },
        // Only include paymentId if it's a valid ObjectId, otherwise omit it
        ...(paymentId && { paymentId }),
        specialRequests: "", // You may want to add a special requests field
      };

      // Create the booking using the real API
      const createdBooking = await createBooking(bookingData);

      // Show success message
      showToast({
        type: "success",
        message: "Reservation created successfully!",
      });

      // Get the confirmation route and log it for debugging
      const confirmationRoute = getConfirmationRoute();
      console.log(
        "ReservationModal: Navigating to confirmation route:",
        confirmationRoute
      );
      console.log("ReservationModal: Current tab context:", currentTabContext);
      console.log("ReservationModal: Navigation params:", {
        id: createdBooking._id || property._id,
        booking: typeof createdBooking,
        property: typeof property,
      });

      // Navigate to confirmation screen with booking and property data
      router.push({
        pathname: confirmationRoute,
        params: {
          id: createdBooking._id || property._id,
          booking: JSON.stringify(createdBooking),
          property: JSON.stringify(property),
          paymentMethod: selectedPaymentMethod
            ? JSON.stringify(selectedPaymentMethod)
            : null,
        },
      });

      // Close the modal after a small delay to ensure navigation completes
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error: any) {
      console.error("Booking creation error:", error);

      // Show appropriate error message
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to create booking. Please try again.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DateStep
            startDate={startDate}
            endDate={endDate}
            onSelectRange={handleDateSelection}
            propertyId={property?._id}
            isCheckingAvailability={isCheckingAvailability}
            isAvailable={isAvailable}
            formatDate={formatDate}
            onAvailabilityChange={handleAvailabilityChange}
          />
        );

      case 2:
        return (
          <GuestStep
            startDate={startDate}
            endDate={endDate}
            adults={adults}
            childrenCount={childrenCount}
            infants={infants}
            pets={pets}
            onChangeAdults={setAdults}
            onChangeChildren={setChildrenCount}
            onChangeInfants={setInfants}
            onChangePets={setPets}
            maxGuests={property?.maxGuests || 10}
            formatDate={formatDate}
            calculateNights={calculateNights}
            onEditDates={() => setStep(1)}
          />
        );

      case 3:
        return (
          <PaymentStep
            startDate={startDate}
            endDate={endDate}
            adults={adults}
            childrenCount={childrenCount}
            pets={pets}
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={handlePaymentMethodChange}
            formatDate={formatDate}
            onEditDates={() => setStep(1)}
            onEditGuests={() => setStep(2)}
          />
        );

      case 4:
        return (
          <ConfirmationStep
            property={property}
            startDate={startDate}
            endDate={endDate}
            adults={adults}
            childrenCount={childrenCount}
            infants={infants}
            pets={pets}
            selectedPaymentMethod={selectedPaymentMethod}
            priceDetails={priceDetails}
            safePropertyPrice={safePropertyPrice}
            formatDate={formatDate}
            calculateNights={calculateNights}
          />
        );

      default:
        return null;
    }
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
            Property information is required to make a reservation.
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
          title: getModalTitle(),
          left: {
            icon: "close",
            onPress: onClose,
          },
        }}
        scrollable
        style={{ paddingBottom: 100 }} // Add space for fixed footer
      >
        <Container>{renderStep()}</Container>
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
          nextButtonTitle={step === 4 ? "Confirm Reservation" : "Next"}
          onNextPress={() => {
            if (step === 4) {
              handleBookingConfirmation();
            } else {
              nextStep();
            }
          }}
          nextButtonDisabled={!canProceed() || isBooking}
          nextButtonLoading={isBooking}
          spacing={24}
        />
      </Container>
    </View>
  );
}
