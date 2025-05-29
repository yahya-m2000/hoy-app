/**
 * Custom hook for booking functionalities
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "../services/bookingService";

export const useUserBookings = (status?: string) => {
  return useQuery({
    queryKey: ["bookings", { status }],
    queryFn: () => bookingService.getUserBookings(status),
  });
};

export const useAllUserBookings = () => {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      // Fetch all bookings without filtering by status
      return bookingService.getUserBookings();
    },
  });
};

export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      // Invalidate the bookings query to refresh data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingService.cancelBooking(id, reason),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
};

export const useCreateBookingReview = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: any) =>
      bookingService.createBookingReview(bookingId, reviewData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({
        queryKey: ["booking", bookingId, "review"],
      });
    },
  });
};
