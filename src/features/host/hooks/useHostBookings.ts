/**
 * Hook for managing host bookings and dashboard data
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { host } from "@core/api/services";
import type { HostBookingFilters } from "@core/types/booking.types";

export const useHostBookings = (filters?: HostBookingFilters) => {
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<HostBookingFilters>(
    filters || {}
  );

  // Fetch bookings query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["hostBookings", localFilters],
    queryFn: async () => {
      try {
        return await host.fetchHostBookings(localFilters);
      } catch (error: any) {
        // Handle 403 errors gracefully - user doesn't have host permissions yet
        if (error?.response?.status === 403) {
          console.log("🔐 [useHostBookings] User doesn't have host permissions yet - returning empty bookings");
          return {
            bookings: [],
            total: 0,
            page: 1,
            totalPages: 1,
          };
        }
        // Re-throw other errors
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (user needs to complete setup)
      if (error?.response?.status === 403) {
        return false;
      }
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => host.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostBookings"] });
      queryClient.invalidateQueries({ queryKey: ["todayBookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const updateFilters = useCallback((newFilters: HostBookingFilters) => {
    setLocalFilters((prev: HostBookingFilters) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  return {
    // Data
    bookings: data?.bookings || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,

    // Loading states
    isLoading,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Error states
    error,
    statusError: updateStatusMutation.error,

    // Actions
    refetch,
    updateBookingStatus: updateStatusMutation.mutateAsync,

    // Filters
    filters: localFilters,
    updateFilters,
    clearFilters,
  };
};

export const useHostBooking = (bookingId: string) => {
  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hostBooking", bookingId],
    queryFn: () => host.fetchHostBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    booking,
    isLoading,
    error,
    refetch,
  };
};

export const useTodayBookings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["todayBookings"],
    queryFn: host.fetchTodayBookings,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return {
    checkIns: data?.checkIns || [],
    checkOuts: data?.checkOuts || [],
    currentStays: data?.currentStays || [],
    isLoading,
    error,
    refetch,
  };
};

export const useDashboardStats = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      try {
        return await host.fetchBookingDashboardStats();
      } catch (error: any) {
        // Handle 403 errors gracefully - user doesn't have host permissions yet
        if (error?.response?.status === 403) {
          console.log("🔐 [useDashboardStats] User doesn't have host permissions yet - returning empty stats");
          return {
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            totalRevenue: 0,
            averageRating: 0,
          };
        }
        // Re-throw other errors
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (user needs to complete setup)
      if (error?.response?.status === 403) {
        return false;
      }
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};

export const useBookingsByDate = (date: string) => {
  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingsByDate", date],
    queryFn: () => host.fetchBookingsByDate(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    bookings: bookings || [],
    isLoading,
    error,
    refetch,
  };
};

export const useCalendarBookings = (startDate: string, endDate: string) => {
  const {
    data: bookingsByDate,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["calendarBookings", startDate, endDate],
    queryFn: () => host.fetchBookingsForDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    bookingsByDate: bookingsByDate || {},
    isLoading,
    error,
    refetch,
  };
};
