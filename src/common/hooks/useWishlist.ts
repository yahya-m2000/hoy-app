/**
 * Wishlist hook for managing saved properties
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@common/context/AuthContext";
import { showAuthPrompt } from "@common/utils/authUtils";
import * as userService from "@common/services/userService";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuth();

  // Only make API calls if user is authenticated
  const isAuthenticated = !!(user && accessToken);

  // Get saved properties - only if authenticated
  const { data: savedProperties = [], ...savedPropertiesQuery } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: userService.getSavedProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only run if user is authenticated
  });

  // Add to wishlist mutation
  const addToWishlist = useMutation({
    mutationFn: (propertyId: string) =>
      userService.addSavedProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: (propertyId: string) =>
      userService.removeSavedProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
    },
  }); // Toggle wishlist status - prompt for authentication if not logged in
  const toggleWishlist = (propertyId: string) => {
    if (!isAuthenticated) {
      // Show authentication prompt
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to save properties to your wishlist.",
      });
      return;
    }

    const isWishlisted = savedProperties.some((p: any) => p._id === propertyId);

    if (isWishlisted) {
      removeFromWishlist.mutate(propertyId);
    } else {
      addToWishlist.mutate(propertyId);
    }
  };

  // Check if property is wishlisted - only if authenticated
  const isPropertyWishlisted = (propertyId: string) => {
    if (!isAuthenticated) return false;
    return savedProperties.some((p: any) => p._id === propertyId);
  };
  return {
    savedProperties,
    isLoading: savedPropertiesQuery.isLoading,
    error: savedPropertiesQuery.error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isPropertyWishlisted,
    isToggling: addToWishlist.isPending || removeFromWishlist.isPending,
    isAuthenticated, // Export authentication status
  };
};
