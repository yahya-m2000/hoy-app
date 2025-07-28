/**
 * Custom hook for managing reservation state and business logic
 * 
 * @module @features/properties/components/reservation/hooks/useReservationState
 */

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useToast } from '@core/context/ToastContext';
import { useCurrentUser } from '@features/user/hooks';
import { createBooking } from '@core/api/services/booking';
import { notificationService } from '@core/services/notification.service';
import type { PropertyType } from '@core/types';

export interface ReservationState {
  step: number;
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  selectedPaymentMethod: any;
  isBooking: boolean;
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
}

export interface ReservationActions {
  setStep: (step: number) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setAdults: (count: number) => void;
  setChildrenCount: (count: number) => void;
  setInfants: (count: number) => void;
  setPets: (count: number) => void;
  setSelectedPaymentMethod: (method: any) => void;
  setIsBooking: (loading: boolean) => void;
  setIsCheckingAvailability: (checking: boolean) => void;
  setIsAvailable: (available: boolean | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleDateSelection: (start: Date, end: Date) => void;
  handleAvailabilityChange: (available: boolean | null, checking: boolean) => void;
  handlePaymentMethodChange: (method: any) => void;
  handleBookingConfirmation: () => Promise<void>;
  resetState: () => void;
}

export function useReservationState(
  property: PropertyType | null,
  unit: any,
  onClose: () => void,
  initialStartDate?: Date,
  initialEndDate?: Date,
  currentTabContext: string = 'properties'
): [ReservationState, ReservationActions] {
  const { showToast } = useToast();
  const { data: currentUser } = useCurrentUser();
  
  // Check if we have initial dates
  const hasInitialDates = Boolean(initialStartDate && initialEndDate);

  // State management - always start with guest details (step 1)
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(hasInitialDates ? true : null);

  // Get the correct confirmation route based on current tab context
  const getConfirmationRoute = useCallback(() => {
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
  }, [currentTabContext]);

  // Step navigation - updated for 3 steps instead of 4
  const nextStep = useCallback(() => {
    if (step < 3) setStep(step + 1);
  }, [step]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  // Handle date selection
  const handleDateSelection = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Handle availability status updates from DateStep
  const handleAvailabilityChange = useCallback((
    available: boolean | null,
    checking: boolean
  ) => {
    setIsAvailable(available);
    setIsCheckingAvailability(checking);
  }, []);

  // Handle payment method change
  const handlePaymentMethodChange = useCallback((method: any) => {
    setSelectedPaymentMethod(method);
  }, []);

  // Handle booking confirmation
  const handleBookingConfirmation = useCallback(async () => {
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

      // Property price handling
      const propertyPrice = unit?.price || property?.price || 0;
      const safePropertyPrice =
        typeof propertyPrice === "number" && !isNaN(propertyPrice)
          ? propertyPrice
          : typeof propertyPrice === "object" && propertyPrice?.amount
          ? propertyPrice.amount
          : 0;

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

      // Prepare booking data using the real API structure
      const bookingData = {
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
        totalPrice: safePropertyPrice * calculateNights(),
        contactInfo: {
          // Get user information from current user data
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Guest",
          email: currentUser?.email || "",
          phone: currentUser?.phoneNumber || "",
        },
        // Only include paymentId if it's valid
        ...(paymentId && { paymentId }),
        specialRequests: "",
      } as const;

      // Create the booking using the real API
      const createdBooking = await createBooking(bookingData);

      // Send ZAAD payment notification if ZAAD payment method is selected
      if (selectedPaymentMethod?.type === 'zaad' && selectedPaymentMethod?.details?.phone) {
        try {
          await notificationService.sendZaadPaymentNotification({
            hostPhone: property.host?.phoneNumber || property.contactInfo?.phone || '+252000000000',
            zaadNumber: selectedPaymentMethod.details.phone,
            amount: String(safePropertyPrice * calculateNights()),
            currency: property.price?.currency || 'USD',
            reservationId: createdBooking._id || createdBooking.id || 'unknown',
            propertyName: property.name || property.title || 'Property',
            checkInDate: startDate.toISOString(),
            checkOutDate: endDate.toISOString(),
          });
          console.log('ZAAD payment notification sent successfully');
        } catch (notificationError) {
          console.error('Failed to send ZAAD payment notification:', notificationError);
          // Don't fail the booking if notification fails
        }
      }

      // Show success message
      showToast({
        type: "success",
        message: "Reservation created successfully!",
      });

      // Get the confirmation route and log it for debugging
      const confirmationRoute = getConfirmationRoute();
      console.log("Navigating to confirmation route:", confirmationRoute);

      // Navigate to confirmation screen with booking data
      router.push({
        pathname: confirmationRoute,
        params: {
          booking: JSON.stringify(createdBooking),
          property: JSON.stringify(property),
        },
      });

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Booking creation failed:", error);
      showToast({
        type: "error",
        message: "Failed to create booking. Please try again.",
      });
    } finally {
      setIsBooking(false);
    }
  }, [
    property,
    startDate,
    endDate,
    adults,
    childrenCount,
    infants,
    pets,
    selectedPaymentMethod,
    unit,
    currentUser,
    showToast,
    getConfirmationRoute,
    onClose,
  ]);

  // Reset state
  const resetState = useCallback(() => {
    setStep(1);
    setStartDate(initialStartDate || null);
    setEndDate(initialEndDate || null);
    setAdults(1);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
    setSelectedPaymentMethod(null);
    setIsBooking(false);
    setIsCheckingAvailability(false);
    setIsAvailable(hasInitialDates ? true : null);
  }, [initialStartDate, initialEndDate, hasInitialDates]);

  const state: ReservationState = {
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
  };

  const actions: ReservationActions = {
    setStep,
    setStartDate,
    setEndDate,
    setAdults,
    setChildrenCount,
    setInfants,
    setPets,
    setSelectedPaymentMethod,
    setIsBooking,
    setIsCheckingAvailability,
    setIsAvailable,
    nextStep,
    prevStep,
    handleDateSelection,
    handleAvailabilityChange,
    handlePaymentMethodChange,
    handleBookingConfirmation,
    resetState,
  };

  return [state, actions];
} 