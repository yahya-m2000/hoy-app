/**
 * Wishlist Collections Service
 * Handles API calls for wishlist collections management
 */

import api from "../core/client";

export interface WishlistCollection {
  _id: string;
  name: string;
  description?: string;
  properties: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

export interface CollectionWithProperties {
  collection: {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  properties: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

class WishlistCollectionsService {
  // Get all user's wishlist collections
  async getCollections(): Promise<WishlistCollection[]> {
    const response = await api.get<{ data: WishlistCollection[] }>(
      "/users/me/wishlist-collections"
    );
    return response.data.data || [];
  }

  // Create a new wishlist collection
  async createCollection(
    data: CreateCollectionRequest
  ): Promise<WishlistCollection> {
    const response = await api.post<{ data: WishlistCollection }>(
      "/users/me/wishlist-collections",
      data
    );
    return response.data.data;
  }

  // Update an existing wishlist collection
  async updateCollection(
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<WishlistCollection> {
    const response = await api.put<{ data: WishlistCollection }>(
      `/users/me/wishlist-collections/${collectionId}`,
      data
    );
    return response.data.data;
  }

  // Delete a wishlist collection
  async deleteCollection(collectionId: string): Promise<void> {
    await api.delete(`/users/me/wishlist-collections/${collectionId}`);
  }

  // Add a property to a collection
  async addPropertyToCollection(
    collectionId: string,
    propertyId: string
  ): Promise<void> {
    await api.post(
      `/users/me/wishlist-collections/${collectionId}/properties/${propertyId}`
    );
  }

  // Remove a property from a collection
  async removePropertyFromCollection(
    collectionId: string,
    propertyId: string
  ): Promise<void> {
    await api.delete(
      `/users/me/wishlist-collections/${collectionId}/properties/${propertyId}`
    );
  }

  // Get properties in a specific collection
  async getCollectionProperties(
    collectionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CollectionWithProperties> {
    const response = await api.get<{ data: CollectionWithProperties }>(
      `/users/me/wishlist-collections/${collectionId}/properties?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }
}

export const wishlistCollectionsService = new WishlistCollectionsService();
