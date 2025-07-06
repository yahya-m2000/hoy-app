/**
 * Booking Confirmation Modal
 * Handles the complete property booking flow including date selection,
 * guest count, payment method, and booking confirmation
 * Converted from route-based overlay to standalone modal component
 */

import React, { useState, useEffect } from "react";
import { ScrollView, Platform, Linking, Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context and hooks
import { useToast } from "@core/context";
import { useCalendarDateSelection } from "@features/calendar/context/CalendarContext";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@features/user/hooks";
import { useTheme } from "@core/hooks";

// Shared components
import { Container, Button, Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";

// Booking module components
import {
  DateSelectionStep,
  GuestDetailsStep,
  PaymentMethodStep,
  ConfirmationStep,
} from "@features/booking/components";

// Booking module services
import { booking } from "@core/api/services";

// Booking module types and utilities
import type { BookingFormData, BookingStep } from "@core/types";
import type { PaymentMethod } from "@core/types/reservation.types";
import {
  calculateNights as calculateNightsBetweenDates,
  formatBookingData,
  createMockBooking,
} from "@features/booking/utils";

// Shared types
import type { PropertyType } from "@core/types";

// Constants
import { fontSize } from "@core/design";

interface BookingConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  property: PropertyType;
  unit?: any;
  initialStartDate?: Date;
  initialEndDate?: Date;
  onBookingComplete?: (booking: any) => void;
}

export default function BookingConfirmationModal({
  visible,
  onClose,
  property,
  unit,
  initialStartDate,
  initialEndDate,
  onBookingComplete,
}: BookingConfirmationModalProps) {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { showToast } = useToast();
  const { selectDatesForProperty } = useCalendarDateSelection();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Parse initial dates
  const hasInitialDates = !!(initialStartDate && initialEndDate);

  // State management
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null,
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
    paymentMethod: null,
    specialRequests: "",
  });

  const [currentStep, setCurrentStep] = useState<BookingStep>(
    hasInitialDates ? "guests" : "dates"
  );
  const [loading, setLoading] = useState(false);
  const [priceDetails, setPriceDetails] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(
    hasInitialDates ? true : null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Property price
  const propertyPrice = unit?.price || property?.price || 0;

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({
        startDate: initialStartDate || null,
        endDate: initialEndDate || null,
        guests: {
          adults: 1,
          children: 0,
          infants: 0,
          pets: 0,
        },
        paymentMethod: null,
        specialRequests: "",
      });
      setCurrentStep(hasInitialDates ? "guests" : "dates");
      setLoading(false);
      setPriceDetails(null);
      setIsAvailable(hasInitialDates ? true : null);
      setIsCheckingAvailability(false);
    }
  }, [visible, initialStartDate, initialEndDate, hasInitialDates]);

  // Update global date context when dates change
  useEffect(() => {
    if (property?._id && formData.startDate && formData.endDate) {
      selectDatesForProperty(property._id, {
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    }
  }, [
    formData.startDate,
    formData.endDate,
    property?._id,
    selectDatesForProperty,
  ]);

  // Initial availability check and price calculation for pre-selected dates
  useEffect(() => {
    if (hasInitialDates && visible) {
      checkAvailabilityAndPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hasInitialDates]);

  // Check availability and calculate price when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate && !hasInitialDates && visible) {
      checkAvailabilityAndPrice();
    } else if (!formData.startDate || !formData.endDate) {
      setIsAvailable(null);
      setPriceDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.startDate,
    formData.endDate,
    formData.guests.adults,
    formData.guests.children,
    visible,
  ]);

  // Check availability and calculate price
  const checkAvailabilityAndPrice = async () => {
    if (!formData.startDate || !formData.endDate || !property) return;

    setIsCheckingAvailability(true);
    try {
      const availabilityParams = {
        propertyId: property._id,
        unitId: unit?._id,
        checkIn: formData.startDate.toISOString(),
        checkOut: formData.endDate.toISOString(),
        guestCount: formData.guests.adults + formData.guests.children,
      };

      const availabilityResult = await booking.checkAvailability(
        availabilityParams
      );
      setIsAvailable(availabilityResult.available);

      if (availabilityResult) {
        const priceParams = {
          propertyId: property._id,
          unitId: unit?._id,
          checkIn: formData.startDate.toISOString(),
          checkOut: formData.endDate.toISOString(),
          guestCount: formData.guests.adults + formData.guests.children,
        };

        const priceResult = await booking.calculatePrice(priceParams);
        setPriceDetails(priceResult);
      } else {
        setPriceDetails(null);
      }
    } catch (error) {
      console.error("Error checking availability:", error);

      if (!hasInitialDates) {
        showToast({
          type: "error",
          message: "Could not check availability",
        });
        setIsAvailable(false);
      } else {
        setIsAvailable(true);
        const nights = calculateNightsBetweenDates(
          formData.startDate,
          formData.endDate
        );
        setPriceDetails({
          totalPrice: propertyPrice * nights,
          cleaningFee: Math.round(propertyPrice * 0.1),
          serviceFee: Math.round(propertyPrice * nights * 0.12),
          taxes: Math.round(propertyPrice * nights * 0.08),
        });
      }
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Handle date selection
  const handleDateSelection = (dates: { startDate: Date; endDate: Date }) => {
    setFormData((prev) => ({
      ...prev,
      startDate: dates.startDate,
      endDate: dates.endDate,
    }));
  };

  // Handle guest changes
  const handleGuestChange = (
    guestType: keyof BookingFormData["guests"],
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        [guestType]: value,
      },
    }));
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethod: any) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod,
    }));
  };

  // Handle booking confirmation
  const handleBookingConfirmation = async () => {
    if (!currentUser) {
      showToast({
        type: "warning",
        message: "Please sign in to complete your booking",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate || !property) {
      showToast({
        type: "error",
        message: "Please select all required information",
      });
      return;
    }

    // Handle ZAAD payment redirection
    if (formData.paymentMethod?.type === "zaad") {
      try {
        const ussdCode = "*123*012345679#";

        if (Platform.OS === "ios") {
          await Linking.openURL("tel:");
          showToast({
            type: "info",
            message: `Please manually enter ${ussdCode} in your dialer`,
          });
          setTimeout(() => proceedWithBookingCreation("pending"), 1500);
        } else {
          const cleanUssdCode = ussdCode.replace(/\s+/g, "");
          Linking.openURL(`tel:${cleanUssdCode}`)
            .then(() => {
              console.log("ZAAD payment initiated via USSD");
              proceedWithBookingCreation("pending");
            })
            .catch((err) => {
              console.error("USSD method failed:", err);
              Linking.openURL("tel:")
                .then(() => {
                  showToast({
                    type: "info",
                    message: `Please manually enter ${ussdCode} in your dialer`,
                  });
                  proceedWithBookingCreation("pending");
                })
                .catch(() => {
                  showToast({
                    type: "error",
                    message:
                      "Could not open phone dialer. Your booking was created, but you'll need to make the ZAAD payment manually.",
                  });
                  proceedWithBookingCreation("pending");
                });
            });
        }
      } catch (error) {
        console.error("Error launching dialer:", error);
        showToast({
          type: "warning",
          message:
            "Could not launch phone dialer, but your booking was created. Please make the ZAAD payment manually.",
        });
        proceedWithBookingCreation("pending");
      }
      return;
    }

    setLoading(true);
    try {
      await proceedWithBookingCreation("confirmed");
    } catch (error: any) {
      console.error("Error creating reservation:", error);

      let errorMessage = "Failed to create reservation";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Property not found or no longer available";
        } else if (error.response.status === 401) {
          errorMessage = "Please sign in again to continue";
        } else if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message || "Invalid reservation details";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection";
      }

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle booking creation
  const proceedWithBookingCreation = async (paymentStatus = "confirmed") => {
    const bookingData = formatBookingData(
      formData,
      property,
      unit,
      currentUser,
      priceDetails,
      formData.paymentMethod,
      formData.specialRequests
    );

    let result;
    try {
      result = await booking.createBooking(bookingData);
    } catch (bookingError: any) {
      console.error("Error in booking service:", bookingError);

      if (bookingError?.message?.includes("Network Error")) {
        showToast({
          type: "error",
          message:
            "Network connection error. Please check your internet connection.",
        });
      }

      // Create mock result for test bookings
      if (formData.paymentMethod?.id?.includes("test")) {
        console.log("Creating mock booking result for test booking");
        result = createMockBooking(
          formData,
          property,
          unit,
          formData.paymentMethod,
          bookingData
        );
      } else {
        throw bookingError;
      }
    }

    const successMessage =
      formData.paymentMethod?.type === "zaad"
        ? "Reservation created successfully! Payment pending confirmation via ZAAD."
        : formData.paymentMethod?.id?.includes("test")
        ? "Test reservation created successfully!"
        : "Reservation created successfully!";

    if (formData.paymentMethod?.type !== "zaad") {
      showToast({
        type: "success",
        message: successMessage,
      });
    }

    const completeBooking = {
      ...result,
      property,
      guests: formData.guests,
      paymentMethod: formData.paymentMethod,
      status:
        "bookingStatus" in result
          ? result.bookingStatus
          : "status" in result
          ? result.status
          : "confirmed",
      cleaningFee: priceDetails?.cleaningFee || 0,
      serviceFee: priceDetails?.serviceFee || 0,
      taxes: priceDetails?.taxes || 0,
    };

    // Call the callback with the complete booking
    onBookingComplete?.(completeBooking);

    // Close the modal
    onClose();
  };

  // Get modal title based on current step
  const getModalTitle = () => {
    switch (currentStep) {
      case "dates":
        return t("reservation.selectDates") || "Select Dates";
      case "guests":
        return t("reservation.guestDetails") || "Guest Details";
      case "payment":
        return t("reservation.paymentMethod") || "Payment Method";
      case "confirmation":
        return t("reservation.confirmReservation") || "Confirm Reservation";
      default:
        return t("reservation.reservation") || "Reservation";
    }
  };

  const ModalHeader = () => (
    <Container
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="md"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
      }}
    >
      <View style={{ width: 40 }} />
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: "600",
          color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
        }}
      >
        {getModalTitle()}
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        }
      />
    </Container>
  );

  // Render current step
  const renderStep = () => {
    const stepProps = {
      onNext: () => {
        switch (currentStep) {
          case "dates":
            setCurrentStep("guests");
            break;
          case "guests":
            setCurrentStep("payment");
            break;
          case "payment":
            setCurrentStep("confirmation");
            break;
        }
      },
      onBack: () => {
        switch (currentStep) {
          case "guests":
            setCurrentStep("dates");
            break;
          case "payment":
            setCurrentStep("guests");
            break;
          case "confirmation":
            setCurrentStep("payment");
            break;
        }
      },
      isLoading: loading,
    };

    switch (currentStep) {
      case "dates":
        return (
          <DateSelectionStep
            {...stepProps}
            dates={{
              startDate: formData.startDate,
              endDate: formData.endDate,
            }}
            onDateChange={(start, end) => {
              const dates = { startDate: start, endDate: end };
              handleDateSelection(dates);
            }}
            propertyId={property?._id}
            isAvailable={isAvailable}
            isCheckingAvailability={isCheckingAvailability}
          />
        );

      case "guests":
        return (
          <GuestDetailsStep
            {...stepProps}
            dates={{
              startDate: formData.startDate,
              endDate: formData.endDate,
            }}
            guests={formData.guests}
            onGuestChange={(field, value) =>
              handleGuestChange(field as keyof BookingFormData["guests"], value)
            }
            maxGuests={property?.maxGuests || 4}
            onDateChangeRequested={() => setCurrentStep("dates")}
          />
        );

      case "payment":
        return (
          <PaymentMethodStep
            {...stepProps}
            selectedMethod={formData.paymentMethod}
            onSelectMethod={handlePaymentMethodSelect}
          />
        );

      case "confirmation":
        return (
          <ConfirmationStep
            {...stepProps}
            property={property}
            dates={{
              startDate: formData.startDate,
              endDate: formData.endDate,
            }}
            guests={formData.guests}
            priceDetails={priceDetails}
            paymentMethod={formData.paymentMethod as unknown as PaymentMethod}
            propertyPrice={propertyPrice}
            onConfirm={handleBookingConfirmation}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <ModalHeader />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </Container>
    </Modal>
  );
}
