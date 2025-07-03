/**
 * Hook for managing the reservation modal state and actions
 */

import { useState } from "react";
import { usePathname } from "expo-router";
import type { PropertyType } from "@core/types/property.types";

interface UseReservationModalProps {
  property: PropertyType | null;
}

export const useReservationModal = ({ property }: UseReservationModalProps) => {
  const pathname = usePathname();

  // Determine the current tab context based on pathname
  const getCurrentTabContext = () => {
    if (pathname.includes("/traveler/home/")) return "home";
    if (pathname.includes("/traveler/search/")) return "search";
    if (pathname.includes("/traveler/wishlist/")) return "wishlist";
    if (pathname.includes("/traveler/bookings/")) return "bookings";
    if (pathname.includes("/traveler/properties/")) return "properties";
    return "properties"; // fallback
  };
  const [isVisible, setIsVisible] = useState(false);
  const [modalProps, setModalProps] = useState<{
    unit?: any;
    initialStartDate?: Date;
    initialEndDate?: Date;
  }>({});

  const currentTabContext = getCurrentTabContext();

  const openReservationModal = (options?: {
    unit?: any;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setModalProps({
      unit: options?.unit,
      initialStartDate: options?.startDate,
      initialEndDate: options?.endDate,
    });
    setIsVisible(true);
  };

  const closeReservationModal = () => {
    setIsVisible(false);
    setModalProps({});
  };

  return {
    isReservationModalVisible: isVisible,
    reservationModalProps: {
      onClose: closeReservationModal,
      property,
      currentTabContext,
      ...modalProps,
    },
    openReservationModal,
    closeReservationModal,
  };
};
