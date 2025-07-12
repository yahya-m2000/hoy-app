/**
 * Custom hook for booking functionalities
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "@core/api/services/booking";
import { useTokenRefresh } from "@core/auth";
import { useAuth } from "@core/context";

export const useUserBookings = (status?: string) => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["bookings", { status }],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching user bookings with status:", status);
        const response = await withTokenRefresh(() =>
          bookingService.getUserBookings(status ? { status } : undefined)
        );
        console.log("✅ User bookings fetched successfully");
        return response;
      } catch (error) {
        console.error("❌ Error fetching user bookings:", error);
        throw error;
      }
    },
    enabled: isAuthenticated && isAuthChecked,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Only log the count, not the full data
      console.log("✅ Select returning bookings array with", data?.length || 0, "items");
      return data;
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
      return withTokenRefresh(() => bookingService.getUserBookings(undefined));
    },
    enabled: isAuthChecked && isAuthenticated,
    retry: false,
  });
};

export const useBookingDetails = (id: string) => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching booking details for ID:", id);
        const response = await withTokenRefresh(() =>
          bookingService.getBookingById(id)
        );
        console.log("✅ Booking details fetched successfully");
        return response;
      } catch (error) {
        console.error("❌ Error fetching booking details:", error);
        throw error;
      }
    },
    enabled: isAuthenticated && isAuthChecked && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
