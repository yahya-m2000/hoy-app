/**
 * Calendar Context for managing booking states and availability across components
 * Ensures all calendar instances are synchronized and use the same data
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { booking } from "@core/api/services";
import type { BookingAvailabilityParams } from "@core/types/booking.types";
import { ContextErrorBoundary } from "@core/error/ContextErrorBoundary";

interface CalendarState {
  selectedDates: {
    start: Date | null;
    end: Date | null;
  };
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  bookedDates: string[];
  blockDates: Date[];
  error: string | null;
  currentPropertyId: string | null; // Track which property this state belongs to
}

interface CalendarContextType extends CalendarState {
  selectDates: (start: Date, end?: Date) => void;
  clearSelection: () => void;
  setPropertyId: (propertyId: string | null) => void;
  checkDateAvailability: (params: BookingAvailabilityParams) => void;
  resetAvailabilityCheck: () => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};

const CalendarProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<CalendarState>({
    selectedDates: { start: null, end: null },
    isCheckingAvailability: false,
    isAvailable: null,
    bookedDates: [],
    blockDates: [],
    error: null,
    currentPropertyId: null,
  });

  // Track the last availability check to prevent duplicate requests
  const lastAvailabilityCheck = useRef<string>("");

  // Query for booked dates when property ID changes
  const { data: bookedDatesData } = useQuery({
    queryKey: ["bookedDates", state.currentPropertyId],
    queryFn: () =>
      state.currentPropertyId
        ? booking.getBookedDatesForProperty(state.currentPropertyId)
        : Promise.resolve([]),
    enabled: !!state.currentPropertyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update booked dates when query data changes
  useEffect(() => {
    if (bookedDatesData) {
      setState((prev) => ({
        ...prev,
        bookedDates: bookedDatesData,
      }));
    }
  }, [bookedDatesData]);

  const selectDates = useCallback((start: Date, end?: Date) => {
    setState((prev) => ({
      ...prev,
      selectedDates: { start, end: end || null },
      isAvailable: null, // Reset availability when dates change
      error: null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDates: { start: null, end: null },
      isAvailable: null,
      error: null,
    }));
  }, []);

  const setPropertyId = useCallback((propertyId: string | null) => {
    setState((prev) => ({
      ...prev,
      currentPropertyId: propertyId,
      selectedDates: { start: null, end: null }, // Clear dates when property changes
      isAvailable: null,
      error: null,
    }));
  }, []);

  const checkDateAvailability = useCallback(
    async (params: BookingAvailabilityParams) => {
      // Create a unique key for this availability check
      const checkKey = `${params.propertyId}-${params.checkIn}-${params.checkOut}`;

      // Prevent duplicate requests
      if (lastAvailabilityCheck.current === checkKey) {
        return;
      }

      lastAvailabilityCheck.current = checkKey;

      setState((prev) => ({
        ...prev,
        isCheckingAvailability: true,
        error: null,
      }));

      try {
        const result = await booking.checkAvailability(params);
        setState((prev) => ({
          ...prev,
          isCheckingAvailability: false,
          isAvailable: result.available,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isCheckingAvailability: false,
          isAvailable: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    },
    []
  );

  const resetAvailabilityCheck = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCheckingAvailability: false,
      isAvailable: null,
      error: null,
    }));
    lastAvailabilityCheck.current = "";
  }, []);

  const contextValue: CalendarContextType = {
    ...state,
    selectDates,
    clearSelection,
    setPropertyId,
    checkDateAvailability,
    resetAvailabilityCheck,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Calendar"
    critical={false}
    enableRetry={true}
    maxRetries={2}
  >
    <CalendarProviderInternal>{children}</CalendarProviderInternal>
  </ContextErrorBoundary>
);
