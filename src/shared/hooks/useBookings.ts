/**
 * Custom hook for booking functionalities
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "@shared/services/bookingService";
import { useTokenRefresh } from "./useTokenRefresh";
import { useAuth } from "@shared/context";

export const useUserBookings = (status?: string) => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["bookings", { status }],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching user bookings with status:", status);
        const result = await withTokenRefresh(() =>
          bookingService.getUserBookings(status)
        );
        console.log(
          "✅ Bookings service returned. Type:",
          typeof result,
          "IsArray:",
          Array.isArray(result),
          "Length:",
          Array.isArray(result) ? result.length : "N/A"
        );
        return result;
      } catch (error) {
        console.error("❌ Bookings fetch failed:", error);
        throw error;
      }
    },
    enabled: isAuthChecked && isAuthenticated, // Only run when authenticated
    retry: false, // Don't retry on auth failures
    select: (data) => {
      console.log(
        "📊 React Query select function received. Type:",
        typeof data,
        "IsArray:",
        Array.isArray(data),
        "Length:",
        Array.isArray(data) ? data.length : "N/A",
        "Value:",
        data
      );

      // At this point, data should be the bookings array directly
      if (Array.isArray(data)) {
        console.log(
          "✅ Select returning bookings array with",
          data.length,
          "items"
        );
        return data;
      }

      console.log(
        "⚠️ Select received non-array, returning empty array. Received:",
        typeof data,
        data
      );
      return [];
    },
  });
};

export const useAllUserBookings = () => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      // Fetch all bookings without filtering by status
      return withTokenRefresh(() => bookingService.getUserBookings());
    },
    enabled: isAuthChecked && isAuthenticated,
    retry: false,
  });
};

export const useBookingDetails = (bookingId: string) => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      return withTokenRefresh(() => bookingService.getBookingById(bookingId));
    },
    enabled: !!bookingId && isAuthChecked && isAuthenticated,
    retry: false,
  });
};

export const useBookingById = (bookingId: string) => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      return withTokenRefresh(() => bookingService.getBookingById(bookingId));
    },
    enabled: !!bookingId && isAuthChecked && isAuthenticated,
    retry: false,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (bookingData: any) =>
      withTokenRefresh(() => bookingService.createBooking(bookingData)),
    onSuccess: () => {
      // Invalidate bookings query to refetch data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (bookingId: string) =>
      withTokenRefresh(() => bookingService.cancelBooking(bookingId)),
    onSuccess: () => {
      // Invalidate bookings query to refetch data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useCreateBookingReview = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: ({
      bookingId,
      reviewData,
    }: {
      bookingId: string;
      reviewData: any;
    }) =>
      withTokenRefresh(() =>
        bookingService.createBookingReview(bookingId, reviewData)
      ),
    onSuccess: (_, variables) => {
      // Invalidate the specific booking query
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
      // Also invalidate all bookings to update reviews count
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
