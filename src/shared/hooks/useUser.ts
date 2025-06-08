import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "@shared/services";
import { User } from "@shared/types";
import { useTokenRefresh } from "./useTokenRefresh";
import { useAuth } from "@shared/context";

/**
 * Hook to get current authenticated user with aggressive cache invalidation
 */
export const useCurrentUser = () => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      return withTokenRefresh(userService.getCurrentUser);
    },
    enabled: isAuthChecked && isAuthenticated,
    staleTime: 10 * 1000, // Very short stale time - just 10 seconds
    gcTime: 30 * 1000, // Even shorter GC time - purge after 30 seconds
    retry: false, // Don't retry on auth failures
  });
};

/**
 * Hook to get user preferences
 */
export const useUserPreferences = () => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: () => withTokenRefresh(userService.getUserPreferences),
    enabled: isAuthChecked && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    retry: false,
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
