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
import {
  getBookedDatesForProperty,
  checkAvailability,
} from "@shared/services/bookingService";
import type { AvailabilityParams } from "@shared/types/booking";

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

interface CalendarContextType {
  state: CalendarState;
  actions: {
    setSelectedDates: (start: Date | null, end: Date | null) => void;
    setCurrentProperty: (propertyId: string | null) => void;
    checkDateAvailability: (
      propertyId: string,
      unitId?: string
    ) => Promise<void>;
    refreshBookedDates: (propertyId: string) => Promise<void>;
    clearSelection: () => void;
    invalidateCache: (propertyId: string) => void;
  };
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};

interface CalendarProviderProps {
  children: React.ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const prevPropertyIdRef = useRef<string | null>(null);

  const [state, setState] = useState<CalendarState>({
    selectedDates: { start: null, end: null },
    isCheckingAvailability: false,
    isAvailable: null,
    bookedDates: [],
    blockDates: [],
    error: null,
    currentPropertyId: null,
  });

  // Query for booked dates when currentPropertyId is set
  const { data: bookedDatesData, refetch: refetchBookedDates } = useQuery({
    queryKey: ["booked-dates", state.currentPropertyId],
    queryFn: () =>
      state.currentPropertyId
        ? getBookedDatesForProperty(state.currentPropertyId)
        : Promise.resolve([]),
    enabled: Boolean(state.currentPropertyId),
    staleTime: 0, // Always consider data stale to force refresh
    gcTime: 10000, // Cache for 10 seconds only (gcTime is the new name for cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: "always" as const, // Always refetch on mount
  });

  // Update state when booked dates change
  useEffect(() => {
    if (bookedDatesData) {
      setState((prev) => ({
        ...prev,
        bookedDates: Array.isArray(bookedDatesData) ? bookedDatesData : [],
      }));
    }
  }, [bookedDatesData]);

  // Clear selected dates when property changes
  useEffect(() => {
    if (
      state.currentPropertyId &&
      state.currentPropertyId !== prevPropertyIdRef.current
    ) {
      setState((prev) => ({
        ...prev,
        selectedDates: { start: null, end: null },
        isAvailable: null,
        error: null,
      }));
      prevPropertyIdRef.current = state.currentPropertyId;
    }
  }, [state.currentPropertyId]);

  const setSelectedDates = useCallback(
    (start: Date | null, end: Date | null) => {
      setState((prev) => ({
        ...prev,
        selectedDates: { start, end },
        isAvailable: null, // Reset availability when dates change
        error: null,
      }));
    },
    []
  );

  const checkDateAvailability = useCallback(
    async (propId: string, unitIdParam?: string) => {
      const { start, end } = state.selectedDates;

      if (!start || !end) {
        setState((prev) => ({
          ...prev,
          isAvailable: null,
          error: "Please select dates",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isCheckingAvailability: true,
        error: null,
      }));

      try {
        const params: AvailabilityParams = {
          propertyId: propId,
          unitId: unitIdParam,
          checkIn: start.toISOString(),
          checkOut: end.toISOString(),
          guestCount: 1, // Default guest count
        };

        const isAvailable = await checkAvailability(params);

        setState((prev) => ({
          ...prev,
          isCheckingAvailability: false,
          isAvailable,
          error: isAvailable ? null : "Selected dates are not available",
        }));
      } catch (error: any) {
        console.error("Error checking availability:", error);
        setState((prev) => ({
          ...prev,
          isCheckingAvailability: false,
          isAvailable: false,
          error: error?.message || "Failed to check availability",
        }));
      }
    },
    [state.selectedDates]
  );

  const refreshBookedDates = useCallback(
    async (propId: string) => {
      try {
        // First, invalidate the queries to ensure we get fresh data
        queryClient.invalidateQueries({ queryKey: ["booked-dates", propId] });
        queryClient.invalidateQueries({
          queryKey: ["property-availability", propId],
        });

        // Then refetch the data
        await refetchBookedDates();

        // Force a direct fetch to update state immediately
        const freshData = await getBookedDatesForProperty(propId);

        // Update state with the fresh data
        setState((prev) => ({
          ...prev,
          bookedDates: Array.isArray(freshData) ? freshData : [],
        }));
      } catch (error) {
        console.error("Error refreshing booked dates:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to refresh calendar data",
        }));
      }
    },
    [refetchBookedDates, queryClient]
  );

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDates: { start: null, end: null },
      isAvailable: null,
      error: null,
    }));
  }, []);

  const setCurrentProperty = useCallback((propertyId: string | null) => {
    setState((prev) => ({
      ...prev,
      currentPropertyId: propertyId,
      selectedDates: { start: null, end: null },
      isAvailable: null,
      error: null,
      bookedDates: [], // Clear previous property's data
      blockDates: [],
    }));
  }, []);

  const invalidateCache = useCallback(
    (propId: string) => {
      // Invalidate all related queries for this property
      queryClient.invalidateQueries({ queryKey: ["booked-dates", propId] });
      queryClient.invalidateQueries({
        queryKey: ["property-availability", propId],
      });

      // Force refresh of current data if it matches current property
      if (propId === state.currentPropertyId) {
        refetchBookedDates();
      }
    },
    [queryClient, state.currentPropertyId, refetchBookedDates]
  );

  const contextValue: CalendarContextType = {
    state,
    actions: {
      setSelectedDates,
      setCurrentProperty,
      checkDateAvailability,
      refreshBookedDates,
      clearSelection,
      invalidateCache,
    },
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;
