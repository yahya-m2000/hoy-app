/**
 * Custom hook for booking actions
 * Encapsulates booking-related actions and state management
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@core/context";
import { useTabBarVisibility } from "@core/navigation/useTabBarVisibility";
import {
  handleAddToCalendar,
  handleGetDirections,
  handleContactGuest,
  canUpdateBooking,
} from "../utils/bookingUtils";
import { updateBookingStatus } from "@core/api/services/host/booking.service";

export const useBookingActions = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const { animateTabBar } = useTabBarVisibility();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  /**
   * Handle reservation press - navigate to booking details
   */
  const handleReservationPress = (reservation: any) => {
    // Hide tab bar when navigating to booking details
    animateTabBar(true);
    // Navigate to booking details using shared screen
    router.push(`/(tabs)/host/today/reservations/${reservation.id}/`);
  };

  /**
   * Handle view all reservations navigation
   */
  const handleViewAllReservations = () => {
    router.push("/(tabs)/host/today/reservations/");
  };

  /**
   * Handle view property navigation
   */
  const handleViewProperty = (booking: any) => {
    if (!booking?.propertyId) return;

    router.push({
      pathname: "/(tabs)/host/today/property/[id]",
      params: {
        property: JSON.stringify(booking.propertyId),
        returnTo: `/(tabs)/host/today/reservations/${booking._id}/`,
      },
    });
  };

  /**
   * Handle update booking status
   */
  const handleUpdateStatus = async (booking: any, newStatus: string) => {
    console.log("handleUpdateStatus called", booking, newStatus);
    // if (!canUpdateBooking(booking)) return; // TEMP: removed for debugging

    return new Promise((resolve) => {
      Alert.alert(
        t("host.today.reservations.updateStatusTitle"),
        t("host.today.reservations.updateStatusMessage", { status: newStatus }),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => resolve(undefined),
          },
          {
            text: t("host.today.reservations.confirm"),
            onPress: async () => {
              setIsUpdatingStatus(true);
              try {
                const updated = await updateBookingStatus(booking._id, newStatus);
                showToast({
                  message: t("host.today.reservations.statusUpdated", { status: newStatus }),
                  type: "success",
                });
                resolve(updated);
              } catch (error) {
                showToast({
                  message: t("host.today.reservations.statusUpdateFailed"),
                  type: "error",
                });
                resolve(undefined);
              } finally {
                setIsUpdatingStatus(false);
              }
            },
          },
        ]
      );
    });
  };

  /**
   * Handle add to calendar action
   */
  const handleCalendarAction = (booking: any) => {
    handleAddToCalendar(booking, showToast, t);
  };

  /**
   * Handle get directions action
   */
  const handleDirectionsAction = (booking: any) => {
    handleGetDirections(booking, showToast, t);
  };

  /**
   * Handle contact guest action
   */
  const handleContactAction = (booking: any) => {
    handleContactGuest(booking, showToast, t);
  };

  /**
   * Handle back navigation
   */
  const handleBackNavigation = () => {
    router.back();
  };

  return {
    // Actions
    handleReservationPress,
    handleViewAllReservations,
    handleViewProperty,
    handleUpdateStatus,
    handleCalendarAction,
    handleDirectionsAction,
    handleContactAction,
    handleBackNavigation,
    
    // State
    isUpdatingStatus,
  };
}; 