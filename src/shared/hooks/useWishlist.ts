/**
 * Wishlist hook for managing saved properties
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/context";
import { showAuthPrompt } from "@shared/utils";
import * as userService from "@shared/services";
import { wishlistCollectionsService } from "@shared/services";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAuthChecked } = useAuth();

  // Get wishlist collections - only if authenticated
  const { data: collections = [], ...collectionsQuery } = useQuery({
    queryKey: ["wishlistCollections"],
    queryFn: () => wishlistCollectionsService.getCollections(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthChecked && isAuthenticated, // Only run if user is authenticated
  });

  // Get saved properties - only if authenticated (legacy system)
  const { data: savedProperties = [], ...savedPropertiesQuery } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: userService.getSavedProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthChecked && isAuthenticated, // Only run if user is authenticated
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
  }; // Check if property is wishlisted - check both collections and legacy saved properties
  const isPropertyWishlisted = (propertyId: string) => {
    if (!isAuthenticated) return false;

    // Check if property exists in any collection (with null safety)
    const isInCollections = collections.some(
      (collection) =>
        collection?.properties &&
        Array.isArray(collection.properties) &&
        collection.properties.includes(propertyId)
    );

    // Check legacy saved properties as fallback (with null safety)
    const isInSavedProperties = savedProperties.some(
      (p: any) => p && p._id === propertyId
    );

    return isInCollections || isInSavedProperties;
  };
  return {
    savedProperties,
    collections, // Export collections data
    isLoading: savedPropertiesQuery.isLoading || collectionsQuery.isLoading,
    isCollectionsLoading: collectionsQuery.isLoading,
    isSavedPropertiesLoading: savedPropertiesQuery.isLoading,
    error: savedPropertiesQuery.error || collectionsQuery.error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isPropertyWishlisted,
    isToggling: addToWishlist.isPending || removeFromWishlist.isPending,
    isAuthenticated, // Export authentication status
    isAuthChecked, // Export auth check status
  };
};
