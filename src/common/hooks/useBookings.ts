/**
 * Custom hook for booking functionalities
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "@traveler-services/bookingService";
import { useTokenRefresh } from "./useTokenRefresh";

export const useUserBookings = (status?: string) => {
  const { withTokenRefresh } = useTokenRefresh();

  return useQuery({
    queryKey: ["bookings", { status }],
    queryFn: () =>
      withTokenRefresh(() => bookingService.getUserBookings(status)),
  });
};

export const useAllUserBookings = () => {
  const { withTokenRefresh } = useTokenRefresh();

  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      // Fetch all bookings without filtering by status
      return withTokenRefresh(() => bookingService.getUserBookings());
    },
  });
};

export const useBookingDetails = (bookingId: string) => {
  const { withTokenRefresh } = useTokenRefresh();

  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () =>
      withTokenRefresh(() => bookingService.getBookingById(bookingId)),
    enabled: !!bookingId,
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
