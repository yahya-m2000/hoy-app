import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "../services/userService";
import { User } from "../types/user";
import { useTokenRefresh } from "./useTokenRefresh";

/**
 * Hook to get current authenticated user with aggressive cache invalidation
 */
export const useCurrentUser = () => {
  const { withTokenRefresh } = useTokenRefresh();
  const queryClient = useQueryClient();

  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: () => withTokenRefresh(userService.getCurrentUser),
    staleTime: 10 * 1000, // Very short stale time - just 10 seconds
    gcTime: 30 * 1000, // Even shorter GC time - purge after 30 seconds
    retry: (failureCount, error: any) => {
      // Check if this is a data integrity error
      if (error?.message?.includes("integrity")) {
        // Force a full cache reset on data integrity errors
        queryClient.clear();
        return false; // Don't retry data integrity errors
      }

      // Don't retry on 401 errors after token refresh has been attempted
      if (error?.response?.status === 401) {
        return false;
      }

      // Otherwise retry just once
      return failureCount < 1;
    },
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (profileData: any) =>
      withTokenRefresh(() => userService.updateProfile(profileData)),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });
};

/**
 * Hook to update user password
 */
export const useUpdatePassword = () => {
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      withTokenRefresh(() => userService.updatePassword(data)),
  });
};

/**
 * Hook to get and update user preferences
 */
export const useUserPreferences = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  const prefsQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => withTokenRefresh(userService.getUserPreferences),
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors after token refresh has been attempted
      if (error?.response?.status === 401) {
        return false;
      }
      // Otherwise retry a few times
      return failureCount < 2;
    },
    // Only attempt to fetch preferences if we have a user
    enabled: !!queryClient.getQueryData(["user"]),
  });

  const updatePrefs = useMutation({
    mutationFn: (data: any) =>
      withTokenRefresh(() => userService.updateUserPreferences(data)),
    onSuccess: (data) => {
      queryClient.setQueryData(["preferences"], data);
    },
  });

  return { ...prefsQuery, updatePrefs };
};

/**
 * Hook to manage payment methods
 */
export const usePaymentMethods = () => {
  const queryClient = useQueryClient();
  const pmQuery = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: userService.getPaymentMethods,
  });
  const addMethod = useMutation({
    mutationFn: userService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
  return { ...pmQuery, addMethod };
};
