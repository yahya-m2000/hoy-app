/**
 * Date Selection Context for the Hoy application
 * Provides global state management for selected dates across the app
 */
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { addDays } from "date-fns";
import * as bookingService from "@shared/services/bookingService";

// Define types for our context
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PropertyDates {
  propertyId: string;
  availableDates: {
    startDate: Date;
    endDate: Date;
    isOptimal?: boolean;
  }[];
  selectedDates: DateRange;
}

interface DateSelectionContextType {
  // Global date selection for search
  searchDates: DateRange;
  setSearchDates: (dates: DateRange) => void;

  // Property-specific date selections
  propertyDates: Map<string, PropertyDates>;

  // Methods to interact with dates
  getOptimalDatesForProperty: (propertyId: string) => Promise<DateRange | null>;
  selectDatesForProperty: (propertyId: string, dates: DateRange) => void;
  clearPropertyDates: (propertyId: string) => void;
  clearAllDates: () => void;

  // For PropertyCard display
  getDisplayDatesForProperty: (propertyId: string) => string;
}

// Create API request queue to avoid rate limiting
interface QueueItem {
  propertyId: string;
  resolve: (value: DateRange | null) => void;
  reject: (reason?: any) => void;
}

export const DateSelectionContext =
  createContext<DateSelectionContextType | null>(null);

export const DateSelectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for global search dates
  const [searchDates, setSearchDates] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // State for property-specific dates
  const [propertyDates, setPropertyDates] = useState<
    Map<string, PropertyDates>
  >(new Map());

  // API queue for processing requests sequentially
  const requestQueue = useRef<QueueItem[]>([]);
  const isProcessingQueue = useRef<boolean>(false);
  // Process the API queue with better throttling
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const { propertyId, resolve, reject } = requestQueue.current.shift()!;

    try {
      // Check if we already have dates for this property in state by getting current state
      setPropertyDates((currentPropertyDates) => {
        const existingPropertyDates = currentPropertyDates.get(propertyId);

        // Return cached optimal dates if available
        if (existingPropertyDates?.availableDates.some((d) => d.isOptimal)) {
          const optimalDates = existingPropertyDates.availableDates.find(
            (d) => d.isOptimal
          );
          if (optimalDates) {
            resolve({
              startDate: optimalDates.startDate,
              endDate: optimalDates.endDate,
            });
            // Continue processing queue with delay to prevent rate limiting
            isProcessingQueue.current = false;
            setTimeout(processQueue, 500);
            return currentPropertyDates; // Return unchanged state
          }
        }

        // Return unchanged state while we fetch data asynchronously
        return currentPropertyDates;
      });

      // Add significant delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch booked dates for property
      const bookedDates = await bookingService.getBookedDatesForProperty(
        propertyId
      );

      // Find a good 3-day window in the next 14-60 days (nearer dates are better for conversion)
      const today = new Date();
      let optimalStartDate: Date | null = null;
      let optimalEndDate: Date | null = null;

      // Default to a 3-day stay (weekend trip)
      const stayLength = 3;

      // Try next 2-8 weeks (good for planning a trip)
      for (let i = 14; i < 60; i++) {
        const potentialStartDate = addDays(today, i);
        const potentialEndDate = addDays(potentialStartDate, stayLength);

        // Check if these dates are booked
        const startDateStr = potentialStartDate.toISOString().split("T")[0];
        const isBooked = bookedDates.some((bookedDate) => {
          const bookedDateStr = new Date(bookedDate)
            .toISOString()
            .split("T")[0];
          return bookedDateStr === startDateStr;
        });

        // If dates aren't booked, use them
        if (!isBooked) {
          optimalStartDate = potentialStartDate;
          optimalEndDate = potentialEndDate;
          break;
        }
      }

      // If no optimal dates found, select a fallback - next available 3-day period
      if (!optimalStartDate) {
        for (let i = 5; i < 180; i++) {
          const potentialStartDate = addDays(today, i);
          const potentialEndDate = addDays(potentialStartDate, stayLength);

          const startDateStr = potentialStartDate.toISOString().split("T")[0];
          const isBooked = bookedDates.some((bookedDate) => {
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

      // If still no available dates, return null
      if (!optimalStartDate || !optimalEndDate) {
        resolve(null);
        isProcessingQueue.current = false;
        setTimeout(processQueue, 300);
        return;
      }

      // Store the found dates in our context using functional state update
      setPropertyDates((currentPropertyDates) => {
        const updatedPropertyDates = new Map(currentPropertyDates);
        const existingDates = updatedPropertyDates.get(propertyId) || {
          propertyId,
          availableDates: [],
          selectedDates: { startDate: null, endDate: null },
        };

        // Add our optimal dates
        existingDates.availableDates.push({
          startDate: optimalStartDate,
          endDate: optimalEndDate,
          isOptimal: true,
        });

        // Set as selected dates for this property
        existingDates.selectedDates = {
          startDate: optimalStartDate,
          endDate: optimalEndDate,
        };

        updatedPropertyDates.set(propertyId, existingDates);
        return updatedPropertyDates;
      });

      // Return the optimal dates
      resolve({
        startDate: optimalStartDate,
        endDate: optimalEndDate,
      });
    } catch (error) {
      console.error("Error finding optimal dates for property:", error);
      reject(error);
    } finally {
      // Continue processing queue
      isProcessingQueue.current = false;
      setTimeout(processQueue, 300);
    }
  }, []); // Remove propertyDates dependency  // Queue a new request
  const queueRequest = useCallback(
    (propertyId: string): Promise<DateRange | null> => {
      return new Promise((resolve, reject) => {
        requestQueue.current.push({ propertyId, resolve, reject });
        processQueue();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // processQueue is stable, so this can be empty
  );
  /**
   * Find optimal dates for a property
   * This checks availability and selects a good date range
   * (typically within the next 14-60 days with a 3-day stay)
   */
  const getOptimalDatesForProperty = useCallback(
    async (propertyId: string): Promise<DateRange | null> => {
      try {
        // Check current state for cached optimal dates
        const currentOptimalDates = await new Promise<DateRange | null>(
          (resolve) => {
            setPropertyDates((currentPropertyDates) => {
              const existingPropertyDates =
                currentPropertyDates.get(propertyId);

              // Return cached optimal dates if available
              if (
                existingPropertyDates?.availableDates.some((d) => d.isOptimal)
              ) {
                const optimalDates = existingPropertyDates.availableDates.find(
                  (d) => d.isOptimal
                );
                if (optimalDates) {
                  resolve({
                    startDate: optimalDates.startDate,
                    endDate: optimalDates.endDate,
                  });
                  return currentPropertyDates; // Return unchanged state
                }
              }

              resolve(null); // No cached data found
              return currentPropertyDates; // Return unchanged state
            });
          }
        );

        if (currentOptimalDates) {
          return currentOptimalDates;
        }

        // Queue the request to prevent rate limiting
        return await queueRequest(propertyId);
      } catch (error) {
        console.error("Error finding optimal dates for property:", error);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Empty dependency array - function is stable
  );
  /**
   * Select dates for a specific property
   */
  const selectDatesForProperty = useCallback(
    (propertyId: string, dates: DateRange) => {
      setPropertyDates((currentPropertyDates) => {
        const updatedPropertyDates = new Map(currentPropertyDates);

        const existingDates = updatedPropertyDates.get(propertyId) || {
          propertyId,
          availableDates: [],
          selectedDates: { startDate: null, endDate: null },
        };

        existingDates.selectedDates = dates;

        updatedPropertyDates.set(propertyId, existingDates);
        return updatedPropertyDates;
      });
    },
    [] // Remove propertyDates dependency
  );
  /**
   * Get a user-friendly display string for property card
   * Note: This function uses the current propertyDates state directly
   * but is memoized to only recreate when the Map reference changes
   */
  const getDisplayDatesForProperty = useCallback(
    (propertyId: string): string => {
      const existingPropertyDates = propertyDates.get(propertyId);

      if (existingPropertyDates?.selectedDates?.startDate) {
        // Format the dates for display
        const startMonth =
          existingPropertyDates.selectedDates.startDate.toLocaleString(
            "default",
            { month: "short" }
          );
        const startDay =
          existingPropertyDates.selectedDates.startDate.getDate();
        return `${startMonth} ${startDay}${
          existingPropertyDates.selectedDates.endDate ? "+" : ""
        }`;
      }

      return "Available soon";
    },
    [propertyDates]
  );

  /**
   * Clear dates for a specific property
   */
  const clearPropertyDates = useCallback(
    (propertyId: string) => {
      setPropertyDates((currentPropertyDates) => {
        const updatedPropertyDates = new Map(currentPropertyDates);
        updatedPropertyDates.delete(propertyId);
        return updatedPropertyDates;
      });
    },
    [] // Remove propertyDates dependency
  );

  /**
   * Clear all dates (both search and property-specific)
   */
  const clearAllDates = useCallback(() => {
    setSearchDates({ startDate: null, endDate: null });
    setPropertyDates(new Map());
  }, []);

  // Context value
  const value = {
    searchDates,
    setSearchDates,
    propertyDates,
    getOptimalDatesForProperty,
    selectDatesForProperty,
    clearPropertyDates,
    clearAllDates,
    getDisplayDatesForProperty,
  };

  return (
    <DateSelectionContext.Provider value={value}>
      {children}
    </DateSelectionContext.Provider>
  );
};

/**
 * Custom hook for using date selection context
 */
export const useDateSelection = () => {
  const context = useContext(DateSelectionContext);

  if (!context) {
    throw new Error(
      "useDateSelection must be used within a DateSelectionProvider"
    );
  }

  return context;
};
