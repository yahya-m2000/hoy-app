import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "@core/api/services/user";
import { UserService } from "@core/api/services/user";
import { User } from "@core/types";
import { useTokenRefresh } from "@core/auth";
import { useAuth } from "@core/context";

/**
 * Hook to get current authenticated user with aggressive cache invalidation
 */
export const useCurrentUser = () => {
  const { withTokenRefresh } = useTokenRefresh();
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return await withTokenRefresh(() => UserService.getCurrentUser());
      } catch (error: any) {
        // If user is not authenticated (401/403), don't treat this as an error
        // This prevents circuit breaker from blocking requests
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('User not authenticated');
        }
        // For other errors, rethrow as-is
        throw error;
      }
    },
    enabled: isAuthChecked && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes to reduce frequent API calls
    gcTime: 10 * 60 * 1000, // Increased to 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (401/403)
      if (error.message === 'User not authenticated' || 
          error.response?.status === 401 || 
          error.response?.status === 403) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus to prevent excessive calls
    refetchOnMount: false, // Only refetch if data is stale
    throwOnError: false, // Don't throw errors to prevent unhandled promise rejections
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
