/**
 * Hook for managing host bookings and dashboard data
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHostBookings,
  fetchBookingsByDate,
  fetchBookingsForDateRange,
  fetchTodayBookings,
  fetchDashboardStats,
  updateBookingStatus,
  fetchHostBooking,
  HostBookingFilters,
} from "../services/hostBookingService";

export const useHostBookings = (filters?: HostBookingFilters) => {
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<HostBookingFilters>(
    filters || {}
  );

  // Fetch bookings query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["hostBookings", localFilters],
    queryFn: () => fetchHostBookings(localFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostBookings"] });
      queryClient.invalidateQueries({ queryKey: ["todayBookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const updateFilters = useCallback((newFilters: HostBookingFilters) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
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
    queryFn: () => fetchHostBooking(bookingId),
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
    queryFn: fetchTodayBookings,
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
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
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
    queryFn: () => fetchBookingsByDate(date),
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
    queryFn: () => fetchBookingsForDateRange(startDate, endDate),
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
