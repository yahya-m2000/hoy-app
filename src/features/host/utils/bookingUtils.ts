/**
 * Booking utility functions
 * Common functions used across booking-related components
 */

import { Platform } from "react-native";
import * as LinkingExpo from "expo-linking";
import { formatDate } from "@core/utils/data/formatting/data-formatters";
import type { ToastType } from "@core/types/common.types";

/**
 * Calculate the number of days between check-in and check-out dates
 */
export const calculateDaysCount = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Map booking status to reservation status
 */
export const mapBookingStatus = (
  status: string
): "upcoming" | "active" | "completed" | "pending" | "cancelled" => {
  switch (status) {
    case "confirmed":
      return "upcoming";
    case "pending":
      return "pending";
    case "in-progress":
    case "in_progress":
      return "active";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

/**
 * Extract guest name from booking data
 */
export const extractGuestName = (booking: any): string => {
  return (
    booking.contactInfo?.name ||
    `${booking.userId?.firstName || ""} ${
      booking.userId?.lastName || ""
    }`.trim() ||
    "Guest"
  );
};

/**
 * Extract property name from booking data
 */
export const extractPropertyName = (booking: any): string => {
  return booking.propertyId?.name || "Property";
};

/**
 * Get total amount from booking data with fallbacks
 */
export const getBookingTotalAmount = (booking: any): number => {
  return booking.totalPrice || booking.totalAmount || 0;
};

/**
 * Check if booking can be updated
 */
export const canUpdateBooking = (booking: any): boolean => {
  if (!booking) return false;
  return ["confirmed", "pending"].includes(booking.status);
};

/**
 * Handle adding booking to calendar
 */
export const handleAddToCalendar = async (
  booking: any,
  showToast: (params: { message: string; type: ToastType }) => void,
  t: (key: string, params?: any) => string
) => {
  if (!booking) return;
  
  const property = booking.propertyId as any;
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const title = t("features.booking.calendar.calendarTitle", {
    property: property?.name || t("features.booking.details.property"),
  });
  const details = t("features.booking.calendar.calendarDetails", {
    checkIn: formatDate(checkInDate, "long"),
    checkOut: formatDate(checkOutDate, "long"),
    guests: booking.guests.adults + (booking.guests.children || 0),
  });

  if (Platform.OS === "ios") {
    // Use Apple Calendar
    const appleCalUrl = `calshow:${checkInDate.getTime() / 1000}`;
    LinkingExpo.openURL(appleCalUrl).catch(() => {
      showToast({ message: t("features.booking.calendar.calendarError"), type: "error" });
    });
  } else {
    // Use Google Calendar
    const startDate =
      checkInDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endDate =
      checkOutDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;
    LinkingExpo.openURL(calendarUrl).catch(() => {
      showToast({ message: t("features.booking.calendar.calendarError"), type: "error" });
    });
  }
};

/**
 * Handle getting directions to property
 */
export const handleGetDirections = (
  booking: any,
  showToast: (params: { message: string; type: ToastType }) => void,
  t: (key: string) => string
) => {
  const property = booking?.propertyId as any;
  if (!property?.coordinates) {
    showToast({ message: t("features.booking.location.locationError"), type: "error" });
    return;
  }
  
  const { latitude, longitude } = property.coordinates;
  let url = "";
  
  if (Platform.OS === "ios") {
    // Apple Maps
    url = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
  } else {
    // Google Maps
    url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
  }
  
  LinkingExpo.openURL(url).catch(() => {
    showToast({ message: t("features.booking.location.mapsError"), type: "error" });
  });
};

/**
 * Handle contacting guest via WhatsApp
 */
export const handleContactGuest = (
  booking: any,
  showToast: (params: { message: string; type: ToastType }) => void,
  t: (key: string) => string
) => {
  const phone = booking?.contactInfo?.phone;
  if (!phone) {
    showToast({ message: t("features.booking.communication.whatsappError"), type: "error" });
    return;
  }
  
  // WhatsApp deep link
  const url = `https://wa.me/${phone}`;
  LinkingExpo.openURL(url).catch(() => {
    showToast({ message: t("features.booking.communication.whatsappError"), type: "error" });
  });
};

/**
 * Transform booking data to reservation format
 */
export const transformBookingToReservation = (booking: any) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    id: booking._id,
    guestName: extractGuestName(booking),
    property: extractPropertyName(booking),
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    status: mapBookingStatus(booking.status),
    totalAmount: getBookingTotalAmount(booking),
    nights: nights > 0 ? nights : 1,
  };
}; 