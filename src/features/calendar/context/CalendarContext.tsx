/**
 * Unified Calendar State Context
 *
 * Centralized state management for all calendar-related functionality
 * including property selection, date selection, view modes, navigation,
 * booking availability, and date range management.
 *
 * @module @features/calendar/context/CalendarStateContext
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { booking } from "@core/api/services";
import { BookingService } from "@core/api/services/booking/booking.service";
import {
  CalendarBookingData,
  BookingAvailabilityParams,
} from "@core/types/booking.types";
import { ContextErrorBoundary } from "@core/error/ContextErrorBoundary";
import { addDays } from "date-fns";

// Types
export interface Property {
  id: string;
  name: string;
  type: string;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface PropertyDates {
  propertyId: string;
  availableDates: {
    startDate: Date;
    endDate: Date;
    isOptimal?: boolean;
  }[];
  selectedDates: DateRange;
}

export interface CalendarState {
  // Property management
  selectedProperty: Property | null;
  properties: Property[];

  // View management
  viewMode: "year" | "month";
  currentYear: number;
  currentMonth: Date;

  // Date selection
  selectedDates: Date[];
  isSelectingRange: boolean;

  // Global search dates
  searchDates: DateRange;

  // Property-specific date selections
  propertyDates: Map<string, PropertyDates>;

  // Navigation
  isPropertySelectorVisible: boolean;
  isEditOverlayVisible: boolean;

  // Animation state
  isCurrentViewExiting: boolean;

  // Booking data
  bookings: CalendarBookingData[];
  isLoadingBookings: boolean;

  // Availability checking
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  bookedDates: string[];
  blockDates: Date[];
  availabilityError: string | null;
  currentPropertyId: string | null;
}

// Action types
type CalendarAction =
  | { type: "SET_SELECTED_PROPERTY"; payload: Property | null }
  | { type: "SET_PROPERTIES"; payload: Property[] }
  | { type: "SET_VIEW_MODE"; payload: "year" | "month" }
  | { type: "SET_CURRENT_YEAR"; payload: number }
  | { type: "SET_CURRENT_MONTH"; payload: Date }
  | { type: "SET_SELECTED_DATES"; payload: Date[] }
  | { type: "SET_IS_SELECTING_RANGE"; payload: boolean }
  | { type: "SET_SEARCH_DATES"; payload: DateRange }
  | { type: "SET_PROPERTY_DATES"; payload: Map<string, PropertyDates> }
  | { type: "SET_PROPERTY_SELECTOR_VISIBLE"; payload: boolean }
  | { type: "SET_EDIT_OVERLAY_VISIBLE"; payload: boolean }
  | { type: "SET_CURRENT_VIEW_EXITING"; payload: boolean }
  | { type: "SET_BOOKINGS"; payload: CalendarBookingData[] }
  | { type: "SET_LOADING_BOOKINGS"; payload: boolean }
  | { type: "SET_CHECKING_AVAILABILITY"; payload: boolean }
  | { type: "SET_AVAILABLE"; payload: boolean | null }
  | { type: "SET_BOOKED_DATES"; payload: string[] }
  | { type: "SET_BLOCK_DATES"; payload: Date[] }
  | { type: "SET_AVAILABILITY_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_PROPERTY_ID"; payload: string | null }
  | { type: "RESET_STATE" };

// Initial state
const initialState: CalendarState = {
  selectedProperty: null,
  properties: [],
  viewMode: "year",
  currentYear: new Date().getFullYear(),
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDates: [],
  isSelectingRange: false,
  searchDates: { startDate: null, endDate: null },
  propertyDates: new Map(),
  isPropertySelectorVisible: false,
  isEditOverlayVisible: false,
  isCurrentViewExiting: false,
  bookings: [],
  isLoadingBookings: false,
  isCheckingAvailability: false,
  isAvailable: null,
  bookedDates: [],
  blockDates: [],
  availabilityError: null,
  currentPropertyId: null,
};

// Reducer
function calendarReducer(
  state: CalendarState,
  action: CalendarAction
): CalendarState {
  switch (action.type) {
    case "SET_SELECTED_PROPERTY":
      return { ...state, selectedProperty: action.payload };

    case "SET_PROPERTIES":
      return { ...state, properties: action.payload };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_CURRENT_YEAR":
      return { ...state, currentYear: action.payload };

    case "SET_CURRENT_MONTH":
      return { ...state, currentMonth: action.payload };

    case "SET_SELECTED_DATES":
      return { ...state, selectedDates: action.payload };

    case "SET_IS_SELECTING_RANGE":
      return { ...state, isSelectingRange: action.payload };

    case "SET_SEARCH_DATES":
      return { ...state, searchDates: action.payload };

    case "SET_PROPERTY_DATES":
      return { ...state, propertyDates: action.payload };

    case "SET_PROPERTY_SELECTOR_VISIBLE":
      return { ...state, isPropertySelectorVisible: action.payload };

    case "SET_EDIT_OVERLAY_VISIBLE":
      return { ...state, isEditOverlayVisible: action.payload };

    case "SET_CURRENT_VIEW_EXITING":
      return { ...state, isCurrentViewExiting: action.payload };

    case "SET_BOOKINGS":
      return { ...state, bookings: action.payload };

    case "SET_LOADING_BOOKINGS":
      return { ...state, isLoadingBookings: action.payload };

    case "SET_CHECKING_AVAILABILITY":
      return { ...state, isCheckingAvailability: action.payload };

    case "SET_AVAILABLE":
      return { ...state, isAvailable: action.payload };

    case "SET_BOOKED_DATES":
      return { ...state, bookedDates: action.payload };

    case "SET_BLOCK_DATES":
      return { ...state, blockDates: action.payload };

    case "SET_AVAILABILITY_ERROR":
      return { ...state, availabilityError: action.payload };

    case "SET_CURRENT_PROPERTY_ID":
      return { ...state, currentPropertyId: action.payload };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// Context
export interface CalendarContextType {
  state: CalendarState;
  dispatch: React.Dispatch<CalendarAction>;

  // Property actions
  setSelectedProperty: (property: Property | null) => void;
  setProperties: (properties: Property[]) => void;

  // View actions
  setViewMode: (mode: "year" | "month") => void;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: Date) => void;

  // Date selection actions
  setSelectedDates: (dates: Date[]) => void;
  setIsSelectingRange: (isSelecting: boolean) => void;

  // Search dates actions
  setSearchDates: (dates: DateRange) => void;

  // Property dates actions
  selectDatesForProperty: (propertyId: string, dates: DateRange) => void;
  clearPropertyDates: (propertyId: string) => void;
  clearAllDates: () => void;
  getOptimalDatesForProperty: (propertyId: string) => Promise<DateRange | null>;
  getDisplayDatesForProperty: (propertyId: string) => string;

  // UI actions
  setPropertySelectorVisible: (visible: boolean) => void;
  setEditOverlayVisible: (visible: boolean) => void;
  setCurrentViewExiting: (exiting: boolean) => void;

  // Booking actions
  setBookings: (bookings: CalendarBookingData[]) => void;
  setLoadingBookings: (loading: boolean) => void;

  // Availability actions
  setPropertyId: (propertyId: string | null) => void;
  checkDateAvailability: (params: BookingAvailabilityParams) => void;
  resetAvailabilityCheck: () => void;

  // Utility actions
  resetState: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

// Provider component
interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const queryClient = useQueryClient();
  const lastAvailabilityCheck = useRef<string>("");
  const requestQueue = useRef<
    Array<{
      propertyId: string;
      resolve: (value: DateRange | null) => void;
      reject: (reason?: any) => void;
    }>
  >([]);
  const isProcessingQueue = useRef<boolean>(false);

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
      dispatch({ type: "SET_BOOKED_DATES", payload: bookedDatesData });
    }
  }, [bookedDatesData]);

  // Property actions
  const setSelectedProperty = useCallback((property: Property | null) => {
    dispatch({ type: "SET_SELECTED_PROPERTY", payload: property });
  }, []);

  const setProperties = useCallback((properties: Property[]) => {
    dispatch({ type: "SET_PROPERTIES", payload: properties });
  }, []);

  // View actions
  const setViewMode = useCallback((mode: "year" | "month") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const setCurrentYear = useCallback((year: number) => {
    dispatch({ type: "SET_CURRENT_YEAR", payload: year });
  }, []);

  const setCurrentMonth = useCallback((month: Date) => {
    dispatch({ type: "SET_CURRENT_MONTH", payload: month });
  }, []);

  // Date selection actions
  const setSelectedDates = useCallback((dates: Date[]) => {
    dispatch({ type: "SET_SELECTED_DATES", payload: dates });
  }, []);

  const setIsSelectingRange = useCallback((isSelecting: boolean) => {
    dispatch({ type: "SET_IS_SELECTING_RANGE", payload: isSelecting });
  }, []);

  // Search dates actions
  const setSearchDates = useCallback((dates: DateRange) => {
    dispatch({ type: "SET_SEARCH_DATES", payload: dates });
  }, []);

  // Property dates actions
  const selectDatesForProperty = useCallback(
    (propertyId: string, dates: DateRange) => {
      const updatedPropertyDates = new Map(state.propertyDates);
      const existingDates = updatedPropertyDates.get(propertyId) || {
        propertyId,
        availableDates: [],
        selectedDates: { startDate: null, endDate: null },
      };

      existingDates.selectedDates = dates;
      updatedPropertyDates.set(propertyId, existingDates);

      dispatch({ type: "SET_PROPERTY_DATES", payload: updatedPropertyDates });
    },
    [state.propertyDates]
  );

  const clearPropertyDates = useCallback(
    (propertyId: string) => {
      const updatedPropertyDates = new Map(state.propertyDates);
      updatedPropertyDates.delete(propertyId);
      dispatch({ type: "SET_PROPERTY_DATES", payload: updatedPropertyDates });
    },
    [state.propertyDates]
  );

  const clearAllDates = useCallback(() => {
    dispatch({ type: "SET_PROPERTY_DATES", payload: new Map() });
  }, []);

  const getDisplayDatesForProperty = useCallback(
    (propertyId: string): string => {
      const propertyDates = state.propertyDates.get(propertyId);
      if (!propertyDates?.selectedDates.startDate) return "Select dates";

      const { startDate, endDate } = propertyDates.selectedDates;
      if (!startDate) return "Select dates";
      if (!endDate) return startDate.toLocaleDateString();

      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    },
    [state.propertyDates]
  );

  // Process the API queue for optimal dates
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const { propertyId, resolve, reject } = requestQueue.current.shift()!;

    try {
      // Check if we already have optimal dates cached
      const existingPropertyDates = state.propertyDates.get(propertyId);
      if (existingPropertyDates?.availableDates.some((d) => d.isOptimal)) {
        const optimalDates = existingPropertyDates.availableDates.find(
          (d) => d.isOptimal
        );
        if (optimalDates) {
          resolve({
            startDate: optimalDates.startDate,
            endDate: optimalDates.endDate,
          });
          isProcessingQueue.current = false;
          setTimeout(processQueue, 500);
          return;
        }
      }

      // Add delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch booked dates for property
      const bookedDates = await BookingService.getBookedDatesForProperty(
        propertyId
      );

      // Find optimal 3-day window
      const today = new Date();
      let optimalStartDate: Date | null = null;
      let optimalEndDate: Date | null = null;
      const stayLength = 3;

      // Try next 2-8 weeks
      for (let i = 14; i < 60; i++) {
        const potentialStartDate = addDays(today, i);
        const potentialEndDate = addDays(potentialStartDate, stayLength);

        const startDateStr = potentialStartDate.toISOString().split("T")[0];
        const isBooked = bookedDates.some((bookedDate: string) => {
          const bookedDateStr = new Date(bookedDate)
            .toISOString()
            .split("T")[0];
          return bookedDateStr === startDateStr;
        });

        if (!isBooked) {
          optimalStartDate = potentialStartDate;
          optimalEndDate = potentialEndDate;
          break;
        }
      }

      // Fallback to next available period
      if (!optimalStartDate) {
        for (let i = 5; i < 180; i++) {
          const potentialStartDate = addDays(today, i);
          const potentialEndDate = addDays(potentialStartDate, stayLength);

          const startDateStr = potentialStartDate.toISOString().split("T")[0];
          const isBooked = bookedDates.some((bookedDate: string) => {
            const bookedDateStr = new Date(bookedDate)
              .toISOString()
              .split("T")[0];
            return bookedDateStr === startDateStr;
          });

          if (!isBooked) {
            optimalStartDate = potentialStartDate;
            optimalEndDate = potentialEndDate;
            break;
          }
        }
      }

      if (!optimalStartDate || !optimalEndDate) {
        resolve(null);
        isProcessingQueue.current = false;
        setTimeout(processQueue, 300);
        return;
      }

      // Store the found dates
      const updatedPropertyDates = new Map(state.propertyDates);
      const existingDates = updatedPropertyDates.get(propertyId) || {
        propertyId,
        availableDates: [],
        selectedDates: { startDate: null, endDate: null },
      };

      existingDates.availableDates.push({
        startDate: optimalStartDate!,
        endDate: optimalEndDate!,
        isOptimal: true,
      });

      updatedPropertyDates.set(propertyId, existingDates);
      dispatch({ type: "SET_PROPERTY_DATES", payload: updatedPropertyDates });

      resolve({
        startDate: optimalStartDate,
        endDate: optimalEndDate,
      });
    } catch (error) {
      reject(error);
    } finally {
      isProcessingQueue.current = false;
      setTimeout(processQueue, 300);
    }
  }, [state.propertyDates]);

  const getOptimalDatesForProperty = useCallback(
    (propertyId: string): Promise<DateRange | null> => {
      return new Promise((resolve, reject) => {
        requestQueue.current.push({ propertyId, resolve, reject });
        processQueue();
      });
    },
    [processQueue]
  );

  // UI actions
  const setPropertySelectorVisible = useCallback((visible: boolean) => {
    dispatch({ type: "SET_PROPERTY_SELECTOR_VISIBLE", payload: visible });
  }, []);

  const setEditOverlayVisible = useCallback((visible: boolean) => {
    dispatch({ type: "SET_EDIT_OVERLAY_VISIBLE", payload: visible });
  }, []);

  const setCurrentViewExiting = useCallback((exiting: boolean) => {
    dispatch({ type: "SET_CURRENT_VIEW_EXITING", payload: exiting });
  }, []);

  // Booking actions
  const setBookings = useCallback((bookings: CalendarBookingData[]) => {
    dispatch({ type: "SET_BOOKINGS", payload: bookings });
  }, []);

  const setLoadingBookings = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING_BOOKINGS", payload: loading });
  }, []);

  // Availability actions
  const setPropertyId = useCallback((propertyId: string | null) => {
    dispatch({ type: "SET_CURRENT_PROPERTY_ID", payload: propertyId });
    dispatch({ type: "SET_SELECTED_DATES", payload: [] });
    dispatch({ type: "SET_AVAILABLE", payload: null });
    dispatch({ type: "SET_AVAILABILITY_ERROR", payload: null });
  }, []);

  const checkDateAvailability = useCallback(
    async (params: BookingAvailabilityParams) => {
      const checkKey = `${params.propertyId}-${params.checkIn}-${params.checkOut}`;

      if (lastAvailabilityCheck.current === checkKey) {
        return;
      }

      lastAvailabilityCheck.current = checkKey;
      dispatch({ type: "SET_CHECKING_AVAILABILITY", payload: true });
      dispatch({ type: "SET_AVAILABILITY_ERROR", payload: null });

      try {
        const result = await booking.checkAvailability(params);
        dispatch({ type: "SET_CHECKING_AVAILABILITY", payload: false });
        dispatch({ type: "SET_AVAILABLE", payload: result.available });
      } catch (error) {
        dispatch({ type: "SET_CHECKING_AVAILABILITY", payload: false });
        dispatch({ type: "SET_AVAILABLE", payload: false });
        dispatch({
          type: "SET_AVAILABILITY_ERROR",
          payload: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    []
  );

  const resetAvailabilityCheck = useCallback(() => {
    dispatch({ type: "SET_CHECKING_AVAILABILITY", payload: false });
    dispatch({ type: "SET_AVAILABLE", payload: null });
    dispatch({ type: "SET_AVAILABILITY_ERROR", payload: null });
    lastAvailabilityCheck.current = "";
  }, []);

  // Utility actions
  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const value: CalendarContextType = {
    state,
    dispatch,
    setSelectedProperty,
    setProperties,
    setViewMode,
    setCurrentYear,
    setCurrentMonth,
    setSelectedDates,
    setIsSelectingRange,
    setSearchDates,
    selectDatesForProperty,
    clearPropertyDates,
    clearAllDates,
    getOptimalDatesForProperty,
    getDisplayDatesForProperty,
    setPropertySelectorVisible,
    setEditOverlayVisible,
    setCurrentViewExiting,
    setBookings,
    setLoadingBookings,
    setPropertyId,
    checkDateAvailability,
    resetAvailabilityCheck,
    resetState,
  };

  return (
    <ContextErrorBoundary
      contextName="Calendar"
      critical={false}
      enableRetry={true}
      maxRetries={2}
    >
      <CalendarContext.Provider value={value}>
        {children}
      </CalendarContext.Provider>
    </ContextErrorBoundary>
  );
}

// Hook to use the calendar context
export function useCalendarState() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendarState must be used within a CalendarProvider");
  }
  return context;
}

// Selector hooks for specific state slices
export function useSelectedProperty() {
  const { state, setSelectedProperty } = useCalendarState();
  return { selectedProperty: state.selectedProperty, setSelectedProperty };
}

export function useViewMode() {
  const { state, setViewMode } = useCalendarState();
  return { viewMode: state.viewMode, setViewMode };
}

export function useCurrentMonth() {
  const { state, setCurrentMonth } = useCalendarState();
  return { currentMonth: state.currentMonth, setCurrentMonth };
}

export function useSelectedDates() {
  const { state, setSelectedDates, setIsSelectingRange } = useCalendarState();
  return {
    selectedDates: state.selectedDates,
    setSelectedDates,
    isSelectingRange: state.isSelectingRange,
    setIsSelectingRange,
  };
}

export function useCalendarUI() {
  const {
    state,
    setPropertySelectorVisible,
    setEditOverlayVisible,
    setCurrentViewExiting,
  } = useCalendarState();

  return {
    isPropertySelectorVisible: state.isPropertySelectorVisible,
    isEditOverlayVisible: state.isEditOverlayVisible,
    isCurrentViewExiting: state.isCurrentViewExiting,
    setPropertySelectorVisible,
    setEditOverlayVisible,
    setCurrentViewExiting,
  };
}

export function useCalendarBookings() {
  const { state, setBookings, setLoadingBookings } = useCalendarState();
  return {
    bookings: state.bookings,
    isLoadingBookings: state.isLoadingBookings,
    setBookings,
    setLoadingBookings,
  };
}

export function useCalendarAvailability() {
  const {
    state,
    setPropertyId,
    checkDateAvailability,
    resetAvailabilityCheck,
  } = useCalendarState();

  return {
    isCheckingAvailability: state.isCheckingAvailability,
    isAvailable: state.isAvailable,
    bookedDates: state.bookedDates,
    blockDates: state.blockDates,
    availabilityError: state.availabilityError,
    currentPropertyId: state.currentPropertyId,
    setPropertyId,
    checkDateAvailability,
    resetAvailabilityCheck,
  };
}

export function useCalendarDateSelection() {
  const {
    state,
    setSearchDates,
    selectDatesForProperty,
    clearPropertyDates,
    clearAllDates,
    getOptimalDatesForProperty,
    getDisplayDatesForProperty,
  } = useCalendarState();

  return {
    searchDates: state.searchDates,
    propertyDates: state.propertyDates,
    setSearchDates,
    selectDatesForProperty,
    clearPropertyDates,
    clearAllDates,
    getOptimalDatesForProperty,
    getDisplayDatesForProperty,
  };
}
