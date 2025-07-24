// Wishlist utilities
export const isInWishlist = (propertyId: string, wishlist: Array<{propertyId: string}>): boolean => {
  return wishlist.some(item => item.propertyId === propertyId);
};