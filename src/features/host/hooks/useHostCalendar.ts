/**
 * Host Calendar Hooks
 * React Query hooks for calendar state management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { host } from "@core/api/services";

import { CalendarUpdateRequest, CalendarSettings } from "@core/types/calendar.types";

// Query keys
const CALENDAR_KEYS = {
  calendar: (propertyId: string) => ["host", "calendar", propertyId],
  bookings: (propertyId: string) => ["host", "bookings", propertyId],
} as const;

/**
 * Hook to fetch property calendar data
 */
export const usePropertyCalendar = (
  propertyId: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: [...CALENDAR_KEYS.calendar(propertyId), startDate, endDate],
    queryFn: () => host.fetchPropertyCalendar(propertyId, startDate, endDate),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch property bookings
 */
export const usePropertyBookings = (
  propertyId: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: [...CALENDAR_KEYS.bookings(propertyId), startDate, endDate],
    queryFn: () => host.fetchPropertyBookings(propertyId, startDate, endDate),
    enabled: !!propertyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for calendar mutations with optimistic updates
 */
export const useCalendarMutations = (propertyId: string) => {
  const queryClient = useQueryClient();

  const invalidateCalendar = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: CALENDAR_KEYS.calendar(propertyId),
    });
    queryClient.invalidateQueries({
      queryKey: CALENDAR_KEYS.bookings(propertyId),
    });
  }, [queryClient, propertyId]);

  // Generic calendar update
  const updateCalendarMutation = useMutation({
    mutationFn: (updateRequest: CalendarUpdateRequest) =>
      host.updatePropertyCalendar(updateRequest),
    onSuccess: () => {
      invalidateCalendar();
    },
    onError: (error) => {
      console.error("Calendar update failed:", error);
    },
  });

  // Availability update
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({
      startDate,
      endDate,
      isAvailable,
    }: {
      startDate: string;
      endDate: string;
      isAvailable: boolean;
    }) => host.updateAvailability(propertyId, startDate, endDate, isAvailable),
    onSuccess: () => {
      invalidateCalendar();
    },
  });

  // Pricing update
  const updatePricingMutation = useMutation({
    mutationFn: ({
      dates,
      price,
      promotionPercentage,
    }: {
      dates: string[];
      price: number;
      promotionPercentage?: number;
    }) => host.updatePricing(propertyId, dates, price, promotionPercentage),
    onSuccess: () => {
      invalidateCalendar();
    },
  });

  // Block dates
  const updateBlockedDatesMutation = useMutation({
    mutationFn: ({
      dates,
      isBlocked,
      blockReason,
    }: {
      dates: string[];
      isBlocked: boolean;
      blockReason?: string;
    }) => host.updateBlockedDates(propertyId, dates, isBlocked, blockReason),
    onSuccess: () => {
      invalidateCalendar();
    },
  });

  // Settings update
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<CalendarSettings>) =>
      host.updateCalendarSettings(propertyId, settings),
    onSuccess: () => {
      invalidateCalendar();
    },
  });

  return {
    updateCalendar: updateCalendarMutation.mutate,
    updateAvailability: updateAvailabilityMutation.mutate,
    updatePricing: updatePricingMutation.mutate,
    updateBlockedDates: updateBlockedDatesMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating:
      updateCalendarMutation.isPending ||
      updateAvailabilityMutation.isPending ||
      updatePricingMutation.isPending ||
      updateBlockedDatesMutation.isPending ||
      updateSettingsMutation.isPending,
    error:
      updateCalendarMutation.error ||
      updateAvailabilityMutation.error ||
      updatePricingMutation.error ||
      updateBlockedDatesMutation.error ||
      updateSettingsMutation.error,
  };
};
