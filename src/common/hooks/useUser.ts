import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "@common/services/userService";
import { User } from "@common/types/user";
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

      return failureCount < 3; // Retry other errors up to 3 times
    },
  });
};

/**
 * Hook to get user preferences
 */
export const useUserPreferences = () => {
  const { withTokenRefresh } = useTokenRefresh();

  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: () => withTokenRefresh(userService.getUserPreferences),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      withTokenRefresh(() => userService.updateProfile(userData)),
    onSuccess: () => {
      // Invalidate the user query on success
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook to update user password
 */
export const useUpdatePassword = () => {
  const { withTokenRefresh } = useTokenRefresh();

  return useMutation({
    mutationFn: (passwordData: {
      currentPassword: string;
      newPassword: string;
    }) => withTokenRefresh(() => userService.updatePassword(passwordData)),
  });
};

/**
 * Hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { withTokenRefresh } = useTokenRefresh();
  return useMutation({
    mutationFn: (preferencesData: any) =>
      withTokenRefresh(() =>
        userService.updateUserPreferences(preferencesData)
      ),
    onSuccess: () => {
      // Invalidate the preferences query on success
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });
};
