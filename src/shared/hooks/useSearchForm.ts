/**
 * Hook to manage search form state across the application
 * Uses React Query for state persistence between component unmounts
 */
import { useCallback } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
// Search parameters interface
export interface SearchFormState {
  location?: string;
  startDate?: string;
  endDate?: string;
  displayDates?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  displayTravelers?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  nights?: number;
  // Added for location search with coordinates
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Default initial state values
const initialState: SearchFormState = {
  location: "",
  startDate: "",
  endDate: "",
  displayDates: "",
  adults: 2,
  children: 0,
  rooms: 1,
  displayTravelers: "2 guests, 1 room",
  propertyType: "",
  minPrice: undefined,
  maxPrice: undefined,
  amenities: [],
  nights: 0,
};

// Key for storing search state in React Query cache
const SEARCH_FORM_KEY = ["searchForm"];

/**
 * Custom hook to manage search form state using React Query
 * for persistence between navigations
 */
export function useSearchForm() {
  const queryClient = useQueryClient();
  // Get current search state from React Query cache
  const { data: searchState = initialState } = useQuery({
    queryKey: SEARCH_FORM_KEY,
    queryFn: () => {
      // Get stored state or return initial state
      const storedState =
        queryClient.getQueryData<SearchFormState>(SEARCH_FORM_KEY);
      return storedState || initialState;
    },
    // Don't refetch on window focus or component remount
    staleTime: Infinity,
    gcTime: Infinity, // Updated from cacheTime (deprecated) to gcTime
  });

  // Update search state mutation
  const { mutate: updateSearchState } = useMutation({
    mutationFn: (newState: Partial<SearchFormState>) => {
      const currentState =
        queryClient.getQueryData<SearchFormState>(SEARCH_FORM_KEY) ||
        initialState;
      const updatedState = { ...currentState, ...newState };
      queryClient.setQueryData(SEARCH_FORM_KEY, updatedState);
      return Promise.resolve(updatedState); // Return a Promise to satisfy TypeScript
    },
    onSuccess: () => {
      // No need to invalidate since we're directly updating the cache
    },
  });

  // Clear search state
  const clearSearchState = useCallback(() => {
    queryClient.setQueryData(SEARCH_FORM_KEY, initialState);
  }, [queryClient]);

  // Reset a specific field to initial state
  const resetField = useCallback(
    (field: keyof SearchFormState) => {
      const currentState =
        queryClient.getQueryData<SearchFormState>(SEARCH_FORM_KEY) ||
        initialState;
      queryClient.setQueryData(SEARCH_FORM_KEY, {
        ...currentState,
        [field]: initialState[field],
      });
    },
    [queryClient]
  );

  return {
    searchState,
    updateSearchState,
    clearSearchState,
    resetField,
  };
}
