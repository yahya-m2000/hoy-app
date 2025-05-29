/**
 * Reservation Modal for the Hoy application
 * Handles the complete property booking flow including date selection,
 * guest count, payment method, and booking confirmation
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";

// Context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useAuth } from "@common/context/AuthContext";
import { useToast } from "@common/context/ToastContext";
import { useDateSelection } from "@common/context/DateSelectionContext";
import { useCurrency } from "@common/hooks/useCurrency";
import { showAuthPrompt } from "@common/utils/authUtils";
// import { useTranslation } from "react-i18next";

// Components
import BottomSheetModal from "@common/components/BottomSheetModal";
import DateRangePicker from "@traveler/components/DateRangePicker";
import GuestSelector from "@traveler/components/GuestSelector";
import PaymentMethodSelector from "@traveler/components/PaymentMethodSelector";

// Services
import * as bookingService from "@traveler/services/bookingService";

// Utils
import { formatCurrency } from "@common/utils/formatting/formatters";

// Types
import type { PropertyType } from "@common/types/property";

// Constants
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

export default function ReservationModal() {
  const { theme, isDark } = useTheme();
  // const { t } = useTranslation();
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();
  const { currency, getSymbol } = useCurrency();
  const params = useLocalSearchParams();
  const { selectDatesForProperty /* , propertyDates */ } = useDateSelection();
  // Parse property and unit data from route parameters
  const property: PropertyType = params.property
    ? JSON.parse(params.property as string)
    : null;

  // Get unit data if passed (for properties with multiple units)
  const unit = params.unit ? JSON.parse(params.unit as string) : null;

  // Get dates if passed - with improved error handling
  const initialStartDate = (() => {
    try {
      if (params.startDate) {
        const date = new Date(params.startDate as string);
        // Check if date is valid
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing startDate:", error);
      return null;
    }
  })();

  const initialEndDate = (() => {
    try {
      if (params.endDate) {
        const date = new Date(params.endDate as string);
        // Check if date is valid
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing endDate:", error);
      return null;
    }
  })();

  // Check if we have valid initial dates
  const hasInitialDates = !!(initialStartDate && initialEndDate);

  // State for reservation
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [specialRequests /* , setSpecialRequests */] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  // UI State - skip date selection if we already have dates
  const [step, setStep] = useState(hasInitialDates ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [priceDetails, setPriceDetails] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(
    hasInitialDates ? true : null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Initial property price
  const propertyPrice = unit?.price || property?.price || 0;

  // Get selected dates either from params or context
  // const selectedDates = React.useMemo(() => {
  //   if (initialStartDate && initialEndDate) {
  //     return {
  //       startDate: initialStartDate,
  //       endDate: initialEndDate,
  //     };
  //   }

  //   return property?._id
  //     ? propertyDates.get(property._id)?.selectedDates || {
  //         startDate: null,
  //         endDate: null,
  //       }
  //     : { startDate: null, endDate: null };
  // }, [initialStartDate, initialEndDate, property?._id, propertyDates]);

  // Update global date context when dates change
  useEffect(() => {
    if (property?._id && startDate && endDate) {
      selectDatesForProperty(property._id, { startDate, endDate });
    }
  }, [startDate, endDate, property?._id, selectDatesForProperty]);

  // Initial availability check and price calculation for pre-selected dates
  useEffect(() => {
    if (hasInitialDates) {
      checkAvailabilityAndPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Check availability and calculate price when dates change
  useEffect(() => {
    if (startDate && endDate && !hasInitialDates) {
      checkAvailabilityAndPrice();
    } else if (!startDate || !endDate) {
      setIsAvailable(null);
      setPriceDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, adults, children, pets]);

  // Check if property is available and calculate price
  const checkAvailabilityAndPrice = async () => {
    if (!startDate || !endDate || !property) return;

    setIsCheckingAvailability(true);
    try {
      // Check availability
      const availabilityParams = {
        propertyId: property._id,
        unitId: unit?._id,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        guestCount: adults + children,
      };

      const availabilityResult = await bookingService.checkAvailability(
        availabilityParams
      );
      setIsAvailable(availabilityResult);

      if (availabilityResult) {
        // Calculate price
        const priceParams = {
          propertyId: property._id,
          unitId: unit?._id,
          checkIn: startDate.toISOString(),
          checkOut: endDate.toISOString(),
          guestCount: adults + children,
        };

        const priceResult = await bookingService.calculatePrice(priceParams);
        setPriceDetails(priceResult);
      } else {
        setPriceDetails(null);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      // Don't show error toast for pre-selected dates
      if (!hasInitialDates) {
        showToast({
          type: "error",
          message: "Could not check availability",
        });
      }

      // Assume available for pre-selected dates if check fails
      if (hasInitialDates) {
        setIsAvailable(true);
        // Set basic price details based on property price
        const nights = calculateNights();
        setPriceDetails({
          totalPrice: propertyPrice * nights,
          cleaningFee: Math.round(propertyPrice * 0.1),
          serviceFee: Math.round(propertyPrice * nights * 0.12),
          taxes: Math.round(propertyPrice * nights * 0.08),
        });
      } else {
        setIsAvailable(false);
      }
    } finally {
      setIsCheckingAvailability(false);
    }
  };

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

  // Calculate nights - with improved error handling
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    try {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 0; // Ensure we return at least 0
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  // Handle date selection with validation
  const handleDateSelection = (start: Date, end: Date) => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date selection:", { start, end });
      showToast({
        type: "error",
        message: "Invalid date selection",
      });
      return;
    }
    setStartDate(start);
    setEndDate(end);
  };
  // Handle reservation submission
  const handleCreateReservation = async () => {
    if (!user) {
      // Redirect to auth modal
      router.push("/(modals)/common/auth");
      return;
    }

    if (!startDate || !endDate || !property) {
      showToast({
        type: "error",
        message: "Please select all required information",
      });
      return;
    } // Handle ZAAD payment - redirect to dialer with USSD code
    if (selectedPaymentMethod?.type === "zaad") {
      try {
        // Prepare the USSD code - currently using a placeholder
        const ussdCode = "*123*012345679#";

        // Different handling for iOS and Android
        if (Platform.OS === "ios") {
          // iOS doesn't support USSD directly, so we'll just open the dialer
          // The user will need to enter the code manually
          await Linking.openURL(`tel:`);

          // Show a toast message with the code to dial
          showToast({
            type: "info",
            message: `Please manually enter ${ussdCode} in your dialer`,
          });

          // Proceed with booking creation after a short delay to allow dialer to open
          setTimeout(() => {
            proceedWithBookingCreation("pending");
          }, 1500);
        } else {
          // For Android, we can try to directly open the USSD code
          // Remove any formatting that might interfere with the USSD code
          const cleanUssdCode = ussdCode.replace(/\s+/g, "");

          // Direct launch method - will work on most Android devices
          Linking.openURL(`tel:${cleanUssdCode}`)
            .then(() => {
              console.log("ZAAD payment initiated via USSD");
              proceedWithBookingCreation("pending");
            })
            .catch((err) => {
              console.error("Primary USSD method failed:", err);

              // Fallback - try without the # symbol which can cause issues on some devices
              if (cleanUssdCode.endsWith("#")) {
                const fallbackCode = cleanUssdCode.slice(0, -1);
                Linking.openURL(`tel:${fallbackCode}`)
                  .then(() => {
                    showToast({
                      type: "info",
                      message: "Please add # at the end of the USSD code",
                    });
                    proceedWithBookingCreation("pending");
                  })
                  .catch((fallbackErr) => {
                    console.error("Fallback USSD method failed:", fallbackErr);

                    // If all else fails, just open the dialer
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
              } else {
                // Just open the dialer if the code doesn't end with #
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
              }
            });
        }
      } catch (error) {
        console.error("Error launching dialer:", error);

        // Still create the booking with pending status, even if dialer fails
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
      // For regular payments, continue with normal flow
      proceedWithBookingCreation("confirmed");
    } catch (error: any) {
      console.error("Error creating reservation:", error);

      // Provide more specific error messages based on error type
      let errorMessage = "Failed to create reservation";

      if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 404) {
          errorMessage = "Property not found or no longer available";
        } else if (error.response.status === 401) {
          errorMessage = "Please sign in again to continue";
        } else if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message || "Invalid reservation details";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later";
        } else if (error.response.status === 501) {
          errorMessage = "Payment processing is not available at the moment";
        }
      } else if (error.request) {
        // No response received - network issue
        errorMessage = "Network error. Please check your connection";
      } else if (error.message) {
        // Something else happened while setting up the request
        errorMessage = error.message;
      }

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  // Helper function to handle booking creation logic
  const proceedWithBookingCreation = async (paymentStatus = "confirmed") => {
    // Check if we're using a test payment method
    const isTestPayment =
      selectedPaymentMethod?.id &&
      (selectedPaymentMethod?.id.includes("test") ||
        selectedPaymentMethod?.id === "test-payment-method" ||
        selectedPaymentMethod?.id === "zaad_payment_method");

    // const isZaadPayment = selectedPaymentMethod?.type === "zaad";

    if (isTestPayment) {
      console.log("Using test payment method - bypassing payment validation");
    }

    // Format booking data according to server validation schema requirements
    const bookingData = {
      propertyId: property._id,
      unitId: unit?._id || property._id,
      // Use the field names required by server validation schema
      checkIn: startDate ? startDate.toISOString() : "",
      checkOut: endDate ? endDate.toISOString() : "",
      // Add guestCount which is required by server validation
      guestCount: adults + children, // Include guests for our internal use (will be removed by bookingService)
      guests: {
        adults: adults || 1, // Ensure we always have at least 1 adult to meet validation requirements
        children: children || 0,
        infants: infants || 0,
        pets: pets || 0,
      },
      totalPrice: priceDetails?.totalPrice || propertyPrice * calculateNights(),
      specialRequests,
      contactInfo: {
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email.split("@")[0],
        email: user.email,
        phone: user.phoneNumber || "",
      },
      // Include payment type
      paymentType: selectedPaymentMethod?.type || "card",
      // For ZAAD payments, set status to pending
      paymentStatus:
        selectedPaymentMethod?.type === "zaad" ? "pending" : paymentStatus,
      // For test payments, don't include paymentId at all
      // For real payments, include paymentId only if it's a valid MongoDB ObjectId
      ...(isTestPayment
        ? {}
        : selectedPaymentMethod?.id &&
          /^[0-9a-fA-F]{24}$/.test(selectedPaymentMethod?.id)
        ? { paymentId: selectedPaymentMethod?.id }
        : {}),
    };

    // If using test payment, add additional logging
    if (isTestPayment) {
      console.log(
        "Making test booking with data:",
        JSON.stringify(bookingData)
      );
    }

    // Verify that our data includes all required fields by server validation schema
    if (!bookingData.checkIn || !bookingData.checkOut) {
      throw new Error("Check-in and check-out dates are required");
    }

    if (!bookingData.guestCount) {
      throw new Error("Guest count is required");
    }

    // Additional logging to help with debugging
    console.log("Booking data validation passed:", {
      dates: `${bookingData.checkIn} - ${bookingData.checkOut}`,
      guestCount: bookingData.guestCount,
      guests: bookingData.guests,
      guestsAdults: bookingData.guests?.adults,
    });

    // Try creating the booking, with fallback for tests if it fails
    let result;
    try {
      result = await bookingService.createBooking(bookingData);
    } catch (bookingError: any) {
      console.error("Error in booking service:", bookingError);

      // Check if it's a network error
      if (bookingError?.message?.includes("Network Error")) {
        showToast({
          type: "error",
          message:
            "Network connection error. Please check your internet connection.",
        });
      }

      if (
        selectedPaymentMethod?.id &&
        (selectedPaymentMethod?.id.includes("test") ||
          selectedPaymentMethod?.id === "test-payment-method" ||
          selectedPaymentMethod?.id === "zaad_payment_method")
      ) {
        // If this is a test booking, generate a mock result
        console.log("Creating mock booking result for test booking");
        result = {
          _id: "mock_" + Math.random().toString(36).substring(2, 15),
          propertyId: property._id,
          unitId: unit?._id || property._id,
          checkIn: startDate?.toISOString(),
          checkOut: endDate?.toISOString(),
          bookingStatus: "confirmed",
          paymentStatus:
            selectedPaymentMethod?.type === "zaad" ? "pending" : "paid",
          totalPrice: bookingData.totalPrice,
          guests: bookingData.guests || {
            adults: adults || 1,
            children: children || 0,
            infants: infants || 0,
            pets: pets || 0,
          },
          contactInfo: bookingData.contactInfo,
          paymentId: bookingData.paymentId,
          paymentType: selectedPaymentMethod?.type || "card",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // If not a test booking, re-throw the error
        throw bookingError;
      }
    } // Adjust toast message based on payment type
    const successMessage =
      selectedPaymentMethod?.type === "zaad"
        ? "Reservation created successfully! Payment pending confirmation via ZAAD."
        : isTestPayment
        ? "Test reservation created successfully!"
        : "Reservation created successfully!";

    // Only show toast for non-ZAAD payments since ZAAD will navigate to a new screen
    if (selectedPaymentMethod?.type !== "zaad") {
      showToast({
        type: "success",
        message: successMessage,
      });
    }

    // Create booking object with all necessary information for confirmation screen
    const completeBooking = {
      ...result,
      property,
      guests: {
        adults: adults || 1, // Ensure we always have at least one adult
        children: children || 0,
        infants: infants || 0,
        pets: pets || 0,
      },
      // Map the paymentMethod object properly for the confirmation screen
      paymentMethod: selectedPaymentMethod
        ? {
            ...selectedPaymentMethod,
            // Handle both the server model field name and our mock result field name
            id: selectedPaymentMethod.id || null,
          }
        : null,
      // Include the booking status field - map from bookingStatus to status for display
      status: result.bookingStatus || "confirmed",
      cleaningFee: priceDetails?.cleaningFee || 0,
      serviceFee: priceDetails?.serviceFee || 0,
      taxes: priceDetails?.taxes || 0,
    }; // Navigate to confirmation screen
    const bookingParam = encodeURIComponent(JSON.stringify(completeBooking));

    // For ZAAD payments, use router.replace instead of push to avoid navigation back to reservation modal
    if (selectedPaymentMethod?.type === "zaad") {
      // Use replace to completely replace the current screen and avoid navigation back to the modal
      router.replace(
        "/(screens)/traveler/booking-confirmation?booking=" + bookingParam
      );
    } else {
      // For other payment methods, push then close the modal
      router.push(
        "/(screens)/traveler/booking-confirmation?booking=" + bookingParam
      );

      // Close this modal - slight delay to ensure navigation happens first
      setTimeout(() => router.back(), 100);
    }
  };
  // Check if authenticated
  useEffect(() => {
    if (!user && !accessToken) {
      // Show auth prompt using the modular utility
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to make a reservation.",
        onCancel: () => router.back(),
      });
    }
  }, [user, accessToken]);

  // Modal title based on current step
  const getModalTitle = () => {
    switch (step) {
      case 1:
        return "Select Dates";
      case 2:
        return "Guest Details";
      case 3:
        return "Payment Method";
      case 4:
        return "Confirm Reservation";
      default:
        return "Reservation";
    }
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <View style={styles.selectedDatesPreview}>
              <Text
                style={[
                  styles.previewTitle,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[300]
                      : theme.colors.grayPalette[700],
                  },
                ]}
              >
                Pre-selected Dates:
              </Text>
              <Text
                style={[
                  styles.previewDates,
                  {
                    color: isDark ? theme.white : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : "No dates selected yet"}
              </Text>
            </View>
            <DateRangePicker
              initialStartDate={startDate}
              initialEndDate={endDate}
              onSelectRange={handleDateSelection}
              minDate={new Date()}
              propertyId={property?._id}
            />
            {isCheckingAvailability && (
              <View style={styles.availabilityCheckingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.availabilityText,
                    { color: theme.colors.gray[600] },
                  ]}
                >
                  Checking availability...
                </Text>
              </View>
            )}
            {!isCheckingAvailability && isAvailable === false && (
              <View
                style={[
                  styles.availabilityErrorContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.error[900]
                      : theme.colors.error[50],
                    borderColor: theme.colors.error[500],
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.error[500]}
                />
                <Text
                  style={[
                    styles.availabilityErrorText,
                    {
                      color: isDark
                        ? theme.colors.error[100]
                        : theme.colors.error[700],
                    },
                  ]}
                >
                  Sorry, this property is not available for the selected dates
                </Text>
              </View>
            )}
            {!isCheckingAvailability && isAvailable && startDate && endDate && (
              <View
                style={[
                  styles.availabilitySuccessContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.success[900]
                      : theme.colors.success[50],
                    borderColor: theme.colors.success[500],
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={theme.colors.success[500]}
                />
                <Text
                  style={[
                    styles.availabilitySuccessText,
                    {
                      color: isDark
                        ? theme.colors.success[100]
                        : theme.colors.success[700],
                    },
                  ]}
                >
                  Property available for {calculateNights()} nights
                </Text>
              </View>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    backgroundColor: isAvailable
                      ? theme.colors.primary
                      : theme.colors.gray[400],
                  },
                ]}
                disabled={!isAvailable || isCheckingAvailability}
                onPress={() => setStep(2)}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            {/* Display selected dates */}
            <View
              style={[
                styles.datesSummaryContainer,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.grayPalette[700]
                    : theme.colors.grayPalette[300],
                },
              ]}
            >
              <View style={styles.datesSummaryRow}>
                <Text
                  style={[
                    styles.datesSummaryLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[300]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  Check-in
                </Text>
                <Text
                  style={[
                    styles.datesSummaryValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {formatDate(startDate)}
                </Text>
              </View>
              <View
                style={[
                  styles.datesDivider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              />
              <View style={styles.datesSummaryRow}>
                <Text
                  style={[
                    styles.datesSummaryLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[300]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  Check-out
                </Text>
                <Text
                  style={[
                    styles.datesSummaryValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {formatDate(endDate)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.changeDatesButton,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={() => setStep(1)}
              >
                <Text
                  style={[
                    styles.changeDatesText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Change dates
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? theme.white : theme.colors.grayPalette[900] },
              ]}
            >
              Guest Information
            </Text>
            <GuestSelector
              adults={adults}
              // eslint-disable-next-line react/no-children-prop
              children={children}
              infants={infants}
              pets={pets}
              maxGuests={property.maxGuests || 4}
              onChangeAdults={setAdults}
              onChangeChildren={setChildren}
              onChangeInfants={setInfants}
              onChangePets={setPets}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setStep(3)}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
            />
            {/* Skip payment option for testing */}
            <TouchableOpacity
              style={[
                styles.skipPaymentButton,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: theme.colors.warning[500],
                  borderWidth: 1,
                  marginTop: spacing.md,
                },
              ]}
              onPress={() => {
                // Create a test payment method
                const testPaymentMethod = {
                  id: "test-payment-method",
                  type: "card" as const,
                  isDefault: true,
                  details: {
                    brand: "Test Card",
                    last4: "1234",
                    expiry: "01/2030",
                  },
                };
                setSelectedPaymentMethod(testPaymentMethod);
                setStep(4);
              }}
            >
              <Ionicons
                name="construct-outline"
                size={20}
                color={theme.colors.warning[500]}
              />
              <Text
                style={[
                  styles.skipPaymentText,
                  { color: theme.colors.warning[500] },
                ]}
              >
                Skip Payment (Testing Only)
              </Text>
            </TouchableOpacity>
            {/* ZAAD Mobile Payment Option */}
            <TouchableOpacity
              style={[
                styles.zaadPaymentButton,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: "#00A651",
                  borderWidth: 1,
                  marginTop: spacing.md,
                },
              ]}
              onPress={() => {
                // Create a ZAAD payment method
                const zaadPaymentMethod = {
                  id: "zaad_payment_method",
                  type: "zaad" as const,
                  isDefault: false,
                  details: {
                    name: "ZAAD Mobile",
                    phone: "123456789",
                  },
                };
                setSelectedPaymentMethod(zaadPaymentMethod);
                setStep(4);
              }}
            >
              <View style={styles.zaadLogoContainer}>
                <Text style={styles.zaadLogoText}>ZAAD</Text>
              </View>
              <Text style={[styles.zaadPaymentText, { color: "#00A651" }]}>
                Pay with ZAAD (Mobile Money)
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(2)}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={theme.colors.grayPalette[700]}
                />
                <Text
                  style={[
                    styles.backButtonText,
                    { color: theme.colors.grayPalette[700] },
                  ]}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    backgroundColor: selectedPaymentMethod
                      ? theme.colors.primary
                      : theme.colors.gray[400],
                  },
                ]}
                disabled={!selectedPaymentMethod}
                onPress={() => setStep(4)}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
      default:
        return (
          <View>
            <View style={styles.confirmationContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme.colors.gray[200]
                      : theme.colors.gray[800],
                  },
                ]}
              >
                Reservation Summary
              </Text>

              <View style={styles.propertyInfoContainer}>
                <Text
                  style={[
                    styles.propertyTitle,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {property?.title}
                </Text>
                <Text
                  style={[
                    styles.propertyLocation,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {property?.city}, {property?.country}
                </Text>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  Dates
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  Nights
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {calculateNights()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  Guests
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {adults} adults{children > 0 ? `, ${children} children` : ""}
                  {infants > 0 ? `, ${infants} infants` : ""}
                  {pets > 0 ? `, ${pets} pets` : ""}
                </Text>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              />

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme.colors.gray[200]
                      : theme.colors.gray[800],
                    marginTop: spacing.md,
                  },
                ]}
              >
                Price Details
              </Text>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {getSymbol(currency)}
                  {formatCurrency(propertyPrice)} x {calculateNights()} nights
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {getSymbol(currency)}
                  {formatCurrency(propertyPrice * calculateNights())}
                </Text>
              </View>

              {priceDetails?.cleaningFee > 0 && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    Cleaning fee
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: isDark
                          ? theme.white
                          : theme.colors.grayPalette[900],
                      },
                    ]}
                  >
                    {getSymbol(currency)}
                    {formatCurrency(priceDetails.cleaningFee)}
                  </Text>
                </View>
              )}

              {priceDetails?.serviceFee > 0 && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    Service fee
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: isDark
                          ? theme.white
                          : theme.colors.grayPalette[900],
                      },
                    ]}
                  >
                    {getSymbol(currency)}
                    {formatCurrency(priceDetails.serviceFee)}
                  </Text>
                </View>
              )}

              {priceDetails?.taxes > 0 && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    Taxes
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: isDark
                          ? theme.white
                          : theme.colors.grayPalette[900],
                      },
                    ]}
                  >
                    {getSymbol(currency)}
                    {formatCurrency(priceDetails.taxes)}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              />

              <View style={[styles.infoRow, styles.totalRow]}>
                <Text
                  style={[
                    styles.totalLabel,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.totalValue,
                    {
                      color: isDark
                        ? theme.white
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {getSymbol(currency)}
                  {formatCurrency(
                    priceDetails?.totalPrice ||
                      propertyPrice * calculateNights()
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              />

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme.colors.gray[200]
                      : theme.colors.gray[800],
                    marginTop: spacing.md,
                  },
                ]}
              >
                Payment Method
              </Text>

              <View
                style={[
                  styles.paymentMethodContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100],
                    borderColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[300],
                  },
                ]}
              >
                <Ionicons
                  name={
                    selectedPaymentMethod?.type === "card"
                      ? "card-outline"
                      : "cash-outline"
                  }
                  size={24}
                  color={
                    isDark
                      ? theme.colors.grayPalette[300]
                      : theme.colors.grayPalette[700]
                  }
                />

                <View style={styles.paymentMethodInfo}>
                  <Text
                    style={[
                      styles.paymentMethodTitle,
                      {
                        color: isDark
                          ? theme.white
                          : theme.colors.grayPalette[900],
                      },
                    ]}
                  >
                    {selectedPaymentMethod?.details?.brand || "Card"} ••••
                    {selectedPaymentMethod?.details?.last4 || "1234"}
                  </Text>

                  {selectedPaymentMethod?.details?.expiry && (
                    <Text
                      style={[
                        styles.paymentMethodSubtitle,
                        {
                          color: isDark
                            ? theme.colors.gray[400]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      Expires {selectedPaymentMethod.details.expiry}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(3)}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={theme.colors.grayPalette[700]}
                />
                <Text
                  style={[
                    styles.backButtonText,
                    { color: theme.colors.grayPalette[700] },
                  ]}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reserveButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleCreateReservation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <>
                    <Text style={styles.reserveButtonText}>
                      Confirm and Pay
                    </Text>
                    <Ionicons name="checkmark" size={20} color={theme.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  if (!property) return null;

  return (
    <BottomSheetModal title={getModalTitle()} showSaveButton={false}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderStep()}
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  selectedDatesPreview: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontSize: fontSize.sm,
  },
  previewDates: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginTop: 4,
  },
  datesSummaryContainer: {
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  datesSummaryRow: {
    padding: spacing.md,
  },
  datesSummaryLabel: {
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  datesSummaryValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  datesDivider: {
    height: 1,
  },
  changeDatesButton: {
    borderTopWidth: 1,
    padding: spacing.sm,
    alignItems: "center",
  },
  changeDatesText: {
    fontWeight: "600",
  },
  skipPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  skipPaymentText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  zaadPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  zaadPaymentText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  zaadLogoContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00A651",
    alignItems: "center",
    justifyContent: "center",
  },
  zaadLogoText: {
    color: "white",
    fontWeight: "700",
    fontSize: fontSize.xs,
  },
  testModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  testModeText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  availabilityCheckingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    marginVertical: spacing.md,
  },
  availabilityText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
  },
  availabilityErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  availabilityErrorText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  availabilitySuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  availabilitySuccessText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.lg,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  continueButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  confirmationContainer: {
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  propertyInfoContainer: {
    marginBottom: spacing.md,
  },
  propertyTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  totalRow: {
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  paymentMethodInfo: {
    marginLeft: spacing.md,
  },
  paymentMethodTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  paymentMethodSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  reserveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  reserveButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  errorText: {
    textAlign: "center",
    padding: spacing.lg,
    fontSize: fontSize.md,
  },
  closeButton: {
    alignSelf: "center",
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
