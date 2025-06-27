/**
 * Wishlist hook for managing saved properties using collections
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/context";
import { showAuthPrompt } from "@shared/utils";
import {
  wishlistCollectionsService,
  WishlistCollection,
} from "@shared/services";

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

  // Get or create default collection
  const getDefaultCollection = async (): Promise<WishlistCollection> => {
    // If no collections exist, create a default "Favorites" collection
    if (collections.length === 0) {
      return await wishlistCollectionsService.createCollection({
        name: "Favorites",
        description: "My favorite properties",
      });
    }
    // Return the first collection as default
    return collections[0];
  };

  // Add to wishlist mutation - uses default collection
  const addToWishlist = useMutation({
    mutationFn: async (propertyId: string) => {
      const defaultCollection = await getDefaultCollection();
      return await wishlistCollectionsService.addPropertyToCollection(
        defaultCollection._id,
        propertyId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
    },
  });

  // Remove from wishlist mutation - removes from all collections
  const removeFromWishlist = useMutation({
    mutationFn: async (propertyId: string) => {
      // Find all collections that contain this property and remove it
      const collectionsWithProperty = collections.filter((collection) =>
        collection.properties.includes(propertyId)
      );

      // Remove from all collections that contain it
      await Promise.all(
        collectionsWithProperty.map((collection) =>
          wishlistCollectionsService.removePropertyFromCollection(
            collection._id,
            propertyId
          )
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
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

    const isWishlisted = isPropertyWishlisted(propertyId);

    if (isWishlisted) {
      removeFromWishlist.mutate(propertyId);
    } else {
      addToWishlist.mutate(propertyId);
    }
  };

  // Check if property is wishlisted - only check collections (new system)
  const isPropertyWishlisted = (propertyId: string) => {
    if (!isAuthenticated) return false;

    // Check if property exists in any collection
    return collections.some(
      (collection) =>
        collection?.properties &&
        Array.isArray(collection.properties) &&
        collection.properties.includes(propertyId)
    );
  };

  return {
    collections, // Export collections data
    isLoading: collectionsQuery.isLoading,
    isCollectionsLoading: collectionsQuery.isLoading,
    error: collectionsQuery.error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isPropertyWishlisted,
    isToggling: addToWishlist.isPending || removeFromWishlist.isPending,
    isAuthenticated, // Export authentication status
    isAuthChecked, // Export auth check status
  };
};
