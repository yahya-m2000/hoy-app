/**
 * Unified Calendar Hook
 * 
 * Provides access to all calendar functionality through the consolidated
 * CalendarStateContext. This hook combines all calendar-related state
 * and actions into a single, easy-to-use interface.
 * 
 * @module @features/calendar/hooks/useCalendar
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { useCallback, useMemo } from 'react';
import { 
  useCalendarState,
  useSelectedProperty,
  useViewMode,
  useCurrentMonth,
  useSelectedDates,
  useCalendarUI,
  useCalendarBookings,
  useCalendarAvailability,
  useCalendarDateSelection,
  Property 
} from '../context/CalendarContext';
import * as dateUtils from '@core/utils/date';
import * as calendarUtils from '../utils/calendarUtils';
import { Platform } from 'react-native';

// Add debug logging utility
const debugLog = (context: string, message: string, data?: any) => {
  console.log(`🔍 [Calendar Hook Debug] ${context}: ${message}`, {
    data,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    stack: new Error().stack?.split('\n').slice(1, 4).join('\n') // First 3 stack frames
  });
};

/**
 * Main calendar hook that provides all calendar functionality
 * 
 * @returns Object containing all calendar state and actions
 * 
 * @example
 * ```tsx
 * function CalendarComponent() {
 *   const {
 *     // Property management
 *     selectedProperty,
 *     properties,
 *     setSelectedProperty,
 *     setProperties,
 *     
 *     // View management
 *     viewMode,
 *     currentYear,
 *     currentMonth,
 *     setViewMode,
 *     setCurrentYear,
 *     setCurrentMonth,
 *     
 *     // Date selection
 *     selectedDates,
 *     isSelectingRange,
 *     setSelectedDates,
 *     setIsSelectingRange,
 *     
 *     // Search dates
 *     searchDates,
 *     setSearchDates,
 *     
 *     // Property dates
 *     propertyDates,
 *     selectDatesForProperty,
 *     clearPropertyDates,
 *     clearAllDates,
 *     getOptimalDatesForProperty,
 *     getDisplayDatesForProperty,
 *     
 *     // UI state
 *     isPropertySelectorVisible,
 *     isEditOverlayVisible,
 *     isCurrentViewExiting,
 *     setPropertySelectorVisible,
 *     setEditOverlayVisible,
 *     setCurrentViewExiting,
 *     
 *     // Bookings
 *     bookings,
 *     isLoadingBookings,
 *     setBookings,
 *     setLoadingBookings,
 *     
 *     // Availability
 *     isCheckingAvailability,
 *     isAvailable,
 *     bookedDates,
 *     blockDates,
 *     availabilityError,
 *     currentPropertyId,
 *     setPropertyId,
 *     checkDateAvailability,
 *     resetAvailabilityCheck,
 *     
 *     // Utilities
 *     resetState,
 *     dispatch
 *   } = useCalendar();
 * }
 */
export function useCalendar() {
  // debugLog("useCalendar", "useCalendar hook called");
  
  try {
    // debugLog("useCalendar", "About to call useCalendarState");
    const { state, dispatch } = useCalendarState();
    // debugLog("useCalendar", "useCalendarState completed", { stateKeys: Object.keys(state) });
    
    // debugLog("useCalendar", "About to call useSelectedProperty");
    const { selectedProperty, setSelectedProperty } = useSelectedProperty();
    // debugLog("useCalendar", "useSelectedProperty completed");
    
    // debugLog("useCalendar", "About to call useViewMode");
    const { viewMode, setViewMode } = useViewMode();
    // debugLog("useCalendar", "useViewMode completed");
    
    // debugLog("useCalendar", "About to call useCurrentMonth");
    const { currentMonth, setCurrentMonth } = useCurrentMonth();
    // debugLog("useCalendar", "useCurrentMonth completed");
    
    // debugLog("useCalendar", "About to call useSelectedDates");
    const { selectedDates, setSelectedDates, isSelectingRange, setIsSelectingRange } = useSelectedDates();
    // debugLog("useCalendar", "useSelectedDates completed");
    
    // debugLog("useCalendar", "About to call useCalendarUI");
    const { 
      isPropertySelectorVisible, 
      isEditOverlayVisible, 
      isCurrentViewExiting,
      setPropertySelectorVisible, 
      setEditOverlayVisible, 
      setCurrentViewExiting 
    } = useCalendarUI();
    // debugLog("useCalendar", "useCalendarUI completed");
    
    // debugLog("useCalendar", "About to call useCalendarBookings");
    const { bookings, isLoadingBookings, setBookings, setLoadingBookings } = useCalendarBookings();
    // debugLog("useCalendar", "useCalendarBookings completed");
    
    // debugLog("useCalendar", "About to call useCalendarAvailability");
    const { 
      isCheckingAvailability,
      isAvailable,
      bookedDates,
      blockDates,
      availabilityError,
      currentPropertyId,
      setPropertyId,
      checkDateAvailability,
      resetAvailabilityCheck
    } = useCalendarAvailability();
    // debugLog("useCalendar", "useCalendarAvailability completed", { 
     // bookedDatesType: typeof bookedDates,
    //  isBookedDatesArray: Array.isArray(bookedDates),
     // bookedDatesLength: Array.isArray(bookedDates) ? bookedDates.length : 'N/A'
    //});
    
    // debugLog("useCalendar", "About to call useCalendarDateSelection");
    const { 
      searchDates,
      propertyDates,
      setSearchDates,
      selectDatesForProperty,
      clearPropertyDates,
      clearAllDates,
      getOptimalDatesForProperty,
      getDisplayDatesForProperty
    } = useCalendarDateSelection();
    // debugLog("useCalendar", "useCalendarDateSelection completed");

    // Enhanced date utilities
    // debugLog("useCalendar", "Creating enhanced date utilities");
    const getCurrentYear = useCallback(() => state.currentYear, [state.currentYear]);
    const setCurrentYear = useCallback((year: number) => {
      dispatch({ type: 'SET_CURRENT_YEAR', payload: year });
    }, [dispatch]);

    // Enhanced property utilities
    const setProperties = useCallback((properties: Property[]) => {
      dispatch({ type: 'SET_PROPERTIES', payload: properties });
    }, [dispatch]);

    // Enhanced reset functionality
    const resetState = useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, [dispatch]);

    // Ensure bookedDates is always an array for safety
    // debugLog("useCalendar", "Creating safeBookedDates memo");
    const safeBookedDates = useMemo(() => {
      // debugLog("useCalendar", "safeBookedDates memo executing", { 
      //   bookedDates,
      //   type: typeof bookedDates,
      //   isArray: Array.isArray(bookedDates)
      // });
      
      if (!Array.isArray(bookedDates)) {
        debugLog("useCalendar", "bookedDates is not an array, returning empty array", { bookedDates });
        return [];
      }
      
      debugLog("useCalendar", "bookedDates is array, returning as-is", { length: bookedDates.length });
      return bookedDates;
    }, [bookedDates]);

    debugLog("useCalendar", "About to return calendar object");
    return {
      // Property management
      selectedProperty,
      properties: state.properties,
      setSelectedProperty,
      setProperties,
      
      // View management
      viewMode,
      currentYear: state.currentYear,
      currentMonth,
      setViewMode,
      setCurrentYear,
      setCurrentMonth,
      
      // Date selection
      selectedDates,
      isSelectingRange,
      setSelectedDates,
      setIsSelectingRange,
      
      // Search dates
      searchDates,
      setSearchDates,
      
      // Property dates
      propertyDates,
      selectDatesForProperty,
      clearPropertyDates,
      clearAllDates,
      getOptimalDatesForProperty,
      getDisplayDatesForProperty,
      
      // UI state
      isPropertySelectorVisible,
      isEditOverlayVisible,
      isCurrentViewExiting,
      setPropertySelectorVisible,
      setEditOverlayVisible,
      setCurrentViewExiting,
      
      // Bookings
      bookings,
      isLoadingBookings,
      setBookings,
      setLoadingBookings,
      
      // Availability
      isCheckingAvailability,
      isAvailable,
      bookedDates: safeBookedDates, // Use safe version
      blockDates,
      availabilityError,
      currentPropertyId,
      setPropertyId,
      checkDateAvailability,
      resetAvailabilityCheck,
      
      // Utilities
      resetState,
      dispatch
    };
  } catch (error) {
    debugLog("useCalendar", "Error in useCalendar hook", { error });
    throw error; // Re-throw to see the actual error
  }
}

/**
 * Hook for property-specific calendar functionality
 * 
 * @param propertyId - The property ID to focus on
 * @returns Property-specific calendar state and actions
 */
export function useCalendarForProperty(propertyId: string) {
  const calendar = useCalendar();
  
  // Note: CalendarBookingData doesn't have propertyId, so we can't filter by property
  // This would need to be handled at the data fetching level
  const propertyBookings = calendar.bookings;
  
  const propertyDates = calendar.propertyDates.get(propertyId);
  
  const setPropertyDates = (dates: any) => {
    calendar.selectDatesForProperty(propertyId, dates);
  };
  
  const clearPropertyDates = () => {
    calendar.clearPropertyDates(propertyId);
  };
  
  const getOptimalDates = () => {
    return calendar.getOptimalDatesForProperty(propertyId);
  };
  
  const getDisplayDates = () => {
    return calendar.getDisplayDatesForProperty(propertyId);
  };
  
  return {
    ...calendar,
    propertyBookings,
    propertyDates,
    setPropertyDates,
    clearPropertyDates,
    getOptimalDates,
    getDisplayDates,
  };
}

/**
 * Hook for date range selection functionality
 * 
 * @returns Date range selection state and actions
 */
export function useDateRangeSelection() {
  const { 
    selectedDates, 
    setSelectedDates, 
    isSelectingRange, 
    setIsSelectingRange,
    searchDates,
    setSearchDates
  } = useCalendar();
  
  const startDate = selectedDates[0] || null;
  const endDate = selectedDates[selectedDates.length - 1] || null;
  
  const selectDateRange = useCallback((start: Date, end: Date) => {
    const dates = dateUtils.getDatesInRange(start, end);
    setSelectedDates(dates);
  }, [setSelectedDates]);
  
  const clearSelection = useCallback(() => {
    setSelectedDates([]);
  }, [setSelectedDates]);
  
  return {
    selectedDates,
    startDate,
    endDate,
    isSelectingRange,
    setIsSelectingRange,
    selectDateRange,
    clearSelection,
    searchDates,
    setSearchDates,
  };
}

/**
 * Hook for calendar navigation and view management
 * 
 * @returns Calendar navigation state and actions
 */
export function useCalendarNavigation() {
  const { 
    viewMode, 
    setViewMode, 
    currentYear, 
    setCurrentYear, 
    currentMonth, 
    setCurrentMonth,
    isCurrentViewExiting,
    setCurrentViewExiting
  } = useCalendar();
  
  const navigateToMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
    setViewMode('month');
  }, [setCurrentMonth, setViewMode]);
  
  const navigateToYear = useCallback((year: number) => {
    setCurrentYear(year);
    setViewMode('year');
  }, [setCurrentYear, setViewMode]);
  
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'year' ? 'month' : 'year';
    setViewMode(newMode);
  }, [viewMode, setViewMode]);
  
  return {
    viewMode,
    currentYear,
    currentMonth,
    isCurrentViewExiting,
    setViewMode,
    setCurrentYear,
    setCurrentMonth,
    setCurrentViewExiting,
    navigateToMonth,
    navigateToYear,
    toggleViewMode,
  };
} 