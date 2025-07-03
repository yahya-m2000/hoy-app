/**
 * Wishlist Services
 * 
 * Centralized exports for all wishlist-related services.
 * 
 * Service Classes:
 * - WishlistService - Wishlist collections and property management
 * 
 * @module @core/api/services/wishlist
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Export service class
export { WishlistService } from './wishlist.service';

// Export types and interfaces
export type {
  WishlistCollection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CollectionWithProperties,
  WishlistItem,
} from './wishlist.service';

// Export legacy service instance for backward compatibility
export { wishlistCollectionsService } from './wishlist.service'; 