/**
 * Wishlist hook
 */

import { useState, useCallback } from "react";

export interface WishlistItemData {
  id: string;
  propertyId: string;
  userId: string;
  createdAt: string;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToWishlist = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      console.log("Adding to wishlist:", propertyId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      console.log("Removing from wishlist:", propertyId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isInWishlist = useCallback((propertyId: string) => {
    return wishlistItems.some(item => item.propertyId === propertyId);
  }, [wishlistItems]);

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};
