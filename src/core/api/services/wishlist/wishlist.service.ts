/**
 * Wishlist Service
 * 
 * Comprehensive wishlist management operations including:
 * - Wishlist collections management
 * - Property wishlist operations
 * - Collection sharing and organization
 * 
 * @module @core/api/services/wishlist
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import type { PropertyType } from "@core/types/property.types";

// ========================================
// Type Definitions
// ========================================

/**
 * Wishlist collection structure
 */
export interface WishlistCollection {
  /** Collection ID */
  _id: string;
  /** Collection name */
  name: string;
  /** Collection description */
  description?: string;
  /** Array of property IDs */
  properties: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Collection visibility */
  isPublic?: boolean;
  /** Collection color/theme */
  color?: string;
  /** Collection emoji/icon */
  emoji?: string;
}

/**
 * Create collection request data
 */
export interface CreateCollectionRequest {
  /** Collection name */
  name: string;
  /** Collection description */
  description?: string;
  /** Collection visibility */
  isPublic?: boolean;
  /** Collection color */
  color?: string;
  /** Collection emoji */
  emoji?: string;
}

/**
 * Update collection request data
 */
export interface UpdateCollectionRequest {
  /** Collection name */
  name?: string;
  /** Collection description */
  description?: string;
  /** Collection visibility */
  isPublic?: boolean;
  /** Collection color */
  color?: string;
  /** Collection emoji */
  emoji?: string;
}

/**
 * Collection with full property data
 */
export interface CollectionWithProperties {
  /** Collection metadata */
  collection: {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    isPublic?: boolean;
    color?: string;
    emoji?: string;
  };
  /** Array of property objects */
  properties: PropertyType[];
  /** Pagination information */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Wishlist item structure
 */
export interface WishlistItem {
  /** Property ID */
  propertyId: string;
  /** Date added to wishlist */
  addedAt: Date;
  /** Collection ID */
  collectionId?: string;
  /** Personal notes */
  notes?: string;
}

// ========================================
// Wishlist Service
// ========================================

/**
 * Wishlist management service class
 */
export class WishlistService {
  /**
   * Get all user's wishlist collections
   * 
   * @returns Promise<WishlistCollection[]> - Array of wishlist collections
   */
  static async getCollections(): Promise<WishlistCollection[]> {
    try {
      const response = await api.get<{
        success: boolean;
        data: WishlistCollection[];
      }>("/users/me/wishlist-collections");
      
      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getWishlistCollections", error);
      return [];
    }
  }

  /**
   * Create a new wishlist collection
   * 
   * @param data - Collection creation data
   * @returns Promise<WishlistCollection> - Created collection
   */
  static async createCollection(data: CreateCollectionRequest): Promise<WishlistCollection> {
    try {
      const response = await api.post<{
        success: boolean;
        data: WishlistCollection;
      }>("/users/me/wishlist-collections", data);
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("createWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Update an existing wishlist collection
   * 
   * @param collectionId - Collection identifier
   * @param data - Collection update data
   * @returns Promise<WishlistCollection> - Updated collection
   */
  static async updateCollection(
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<WishlistCollection> {
    try {
      const response = await api.put<{
        success: boolean;
        data: WishlistCollection;
      }>(`/users/me/wishlist-collections/${collectionId}`, data);
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("updateWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Delete a wishlist collection
   * 
   * @param collectionId - Collection identifier
   * @returns Promise<void>
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await api.delete(`/users/me/wishlist-collections/${collectionId}`);
    } catch (error: any) {
      logErrorWithContext("deleteWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Add a property to a collection
   * 
   * @param collectionId - Collection identifier
   * @param propertyId - Property identifier
   * @param notes - Optional personal notes
   * @returns Promise<void>
   */
  static async addPropertyToCollection(
    collectionId: string,
    propertyId: string,
    notes?: string
  ): Promise<void> {
    try {
      await api.post(
        `/users/me/wishlist-collections/${collectionId}/properties/${propertyId}`,
        { notes }
      );
    } catch (error: any) {
      logErrorWithContext("addPropertyToWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Remove a property from a collection
   * 
   * @param collectionId - Collection identifier
   * @param propertyId - Property identifier
   * @returns Promise<void>
   */
  static async removePropertyFromCollection(
    collectionId: string,
    propertyId: string
  ): Promise<void> {
    try {
      await api.delete(
        `/users/me/wishlist-collections/${collectionId}/properties/${propertyId}`
      );
    } catch (error: any) {
      logErrorWithContext("removePropertyFromWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Get properties in a specific collection
   * 
   * @param collectionId - Collection identifier
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Promise<CollectionWithProperties> - Collection with properties
   */
  static async getCollectionProperties(
    collectionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CollectionWithProperties> {
    try {
      const response = await api.get<{
        success: boolean;
        data: CollectionWithProperties;
      }>(`/users/me/wishlist-collections/${collectionId}/properties`, {
        params: { page, limit },
      });
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("getCollectionProperties", error);
      throw error;
    }
  }

  /**
   * Add property to user's default wishlist
   * 
   * @param propertyId - Property identifier
   * @returns Promise<void>
   */
  static async addToWishlist(propertyId: string): Promise<void> {
    try {
      await api.post(`/users/me/wishlist`, { propertyId });
    } catch (error: any) {
      logErrorWithContext("addToWishlist", error);
      throw error;
    }
  }

  /**
   * Remove property from user's wishlist
   * 
   * @param propertyId - Property identifier
   * @returns Promise<void>
   */
  static async removeFromWishlist(propertyId: string): Promise<void> {
    try {
      await api.delete(`/users/me/wishlist/${propertyId}`);
    } catch (error: any) {
      logErrorWithContext("removeFromWishlist", error);
      throw error;
    }
  }

  /**
   * Check if property is in user's wishlist
   * 
   * @param propertyId - Property identifier
   * @returns Promise<boolean> - True if property is wishlisted
   */
  static async isPropertyWishlisted(propertyId: string): Promise<boolean> {
    try {
      const response = await api.get<{
        success: boolean;
        data: { isWishlisted: boolean };
      }>(`/users/me/wishlist/${propertyId}/status`);
      
      return response.data.data.isWishlisted;
    } catch (error: any) {
      logErrorWithContext("isPropertyWishlisted", error);
      return false;
    }
  }

  /**
   * Get user's complete wishlist (all properties across all collections)
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise<{ properties: PropertyType[], pagination: any }> - Wishlist data
   */
  static async getWishlist(page: number = 1, limit: number = 20): Promise<{
    properties: PropertyType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          properties: PropertyType[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>("/users/me/wishlist", {
        params: { page, limit },
      });
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("getWishlist", error);
      return {
        properties: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Share a wishlist collection
   * 
   * @param collectionId - Collection identifier
   * @param isPublic - Whether to make collection public
   * @returns Promise<{ shareUrl: string }> - Share URL
   */
  static async shareCollection(collectionId: string, isPublic: boolean = true): Promise<{ shareUrl: string }> {
    try {
      const response = await api.post<{
        success: boolean;
        data: { shareUrl: string };
      }>(`/users/me/wishlist-collections/${collectionId}/share`, {
        isPublic,
      });
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("shareWishlistCollection", error);
      throw error;
    }
  }

  /**
   * Get a public wishlist collection by share token
   * 
   * @param shareToken - Collection share token
   * @returns Promise<CollectionWithProperties> - Public collection data
   */
  static async getPublicCollection(shareToken: string): Promise<CollectionWithProperties> {
    try {
      const response = await api.get<{
        success: boolean;
        data: CollectionWithProperties;
      }>(`/public/wishlist-collections/${shareToken}`);
      
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("getPublicWishlistCollection", error);
      throw error;
    }
  }
}

// ========================================
// Legacy Exports
// ========================================

/**
 * Legacy instance-based service
 * @deprecated Use static WishlistService methods instead
 */
class WishlistCollectionsService {
  async getCollections(): Promise<WishlistCollection[]> {
    return WishlistService.getCollections();
  }

  async createCollection(data: CreateCollectionRequest): Promise<WishlistCollection> {
    return WishlistService.createCollection(data);
  }

  async updateCollection(
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<WishlistCollection> {
    return WishlistService.updateCollection(collectionId, data);
  }

  async deleteCollection(collectionId: string): Promise<void> {
    return WishlistService.deleteCollection(collectionId);
  }

  async addPropertyToCollection(
    collectionId: string,
    propertyId: string
  ): Promise<void> {
    return WishlistService.addPropertyToCollection(collectionId, propertyId);
  }

  async removePropertyFromCollection(
    collectionId: string,
    propertyId: string
  ): Promise<void> {
    return WishlistService.removePropertyFromCollection(collectionId, propertyId);
  }

  async getCollectionProperties(
    collectionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CollectionWithProperties> {
    return WishlistService.getCollectionProperties(collectionId, page, limit);
  }
}

/**
 * Legacy instance export
 * @deprecated Use WishlistService static methods instead
 */
export const wishlistCollectionsService = new WishlistCollectionsService();

// Default export
export default WishlistService;
