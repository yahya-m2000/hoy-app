/**
 * Host Property Service
 * 
 * Handles CRUD operations for host property management including:
 * - Property creation and updates
 * - Property status management
 * - Image upload and management
 * - Property listing and filtering
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import type { Property } from "@core/types/property.types";
import { logger } from "@core/utils/sys/log";

// ========================================
// Type Definitions
// ========================================

/**
 * Property creation data structure
 */
export interface CreatePropertyData {
  /** Property name/title */
  name: string;
  /** Property type (required by server schema) */
  type: string;
  /** Detailed property type */
  propertyType: string;
  /** Property address */
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Geographic coordinates */
  coordinates: {
    latitude: number;
    longitude: number;
  };
  /** Property description */
  description: string;
  /** Available amenities */
  amenities: string[];
  /** Maximum number of guests */
  maxGuests: number;
  /** Number of bedrooms */
  bedrooms: number;
  /** Number of beds (required by server schema) */
  beds: number;
  /** Number of bathrooms */
  bathrooms: number;
  /** Base price per night */
  price: number;
  /** Currency code */
  currency: string;
  /** Property images */
  images?: string[];
  /** House rules */
  houseRules?: any;
  /** Safety features */
  safetyFeatures?: any;
  /** Cancellation policy */
  cancellationPolicy?: any;
}

/**
 * Property update data structure
 */
export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  /** Property ID for updates */
  _id: string;
}

/**
 * Property filtering options
 */
export interface HostPropertyFilters {
  /** Property status filter */
  status?: string;
  /** Property type filter */
  propertyType?: string;
  /** Page number for pagination */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Paginated properties response
 */
export interface PropertyListResponse {
  /** Array of properties */
  properties: Property[];
  /** Total number of properties */
  total: number;
  /** Current page */
  page: number;
  /** Total number of pages */
  totalPages: number;
}

// ========================================
// Host Property Service
// ========================================

/**
 * Service class for host property management operations
 * 
 * @class HostPropertyService
 */
export class HostPropertyService {
  /**
   * Get all properties for the current host with optional filtering
   * 
   * @param filters - Optional filtering and pagination parameters
   * @returns Promise<PropertyListResponse> - Paginated property list
   * @throws Error if API call fails
   */
  static async getProperties(filters?: HostPropertyFilters): Promise<PropertyListResponse> {
    try {
      logger.log("HostPropertyService.getProperties called with filters:", filters);
      
      const response = await api.get<{
        success: boolean;
        data: PropertyListResponse;
      }>("/host/properties", { params: filters });
      
      logger.log("HostPropertyService.getProperties response:", response.data);
      return response.data.data;
    } catch (error) {
      logger.error("HostPropertyService.getProperties error:", error);
      logErrorWithContext("getHostProperties", error);
      throw error;
    }
  }

  /**
   * Get a specific property by ID for the current host
   * 
   * @param propertyId - Property identifier
   * @returns Promise<Property> - Property details
   * @throws Error if property not found or API call fails
   */
  static async getProperty(propertyId: string): Promise<Property> {
    try {
      const response = await api.get<any>(`/host/properties/${propertyId}`);

      /*
       * Back-end endpoints are not yet fully standardized. Some return
       * { success, data } wrappers while others return the raw entity.
       * Support both shapes here so the UI remains robust.
       */
      if (response.data && typeof response.data === "object") {
        if ("data" in response.data) {
          // New/standardised format { success, data }
          return (response.data as { data: Property }).data;
        }
        // Legacy/unwrapped format – assume the payload itself is Property
        return response.data as Property;
      }

      throw new Error("Invalid response format from getProperty API");
    } catch (error) {
      logErrorWithContext("getHostProperty", error);
      throw error;
    }
  }

  /**
   * Create a new property
   * 
   * @param propertyData - Property creation data
   * @returns Promise<Property> - Created property
   * @throws Error if creation fails
   */
  static async createProperty(propertyData: CreatePropertyData): Promise<Property> {
    try {
      const response = await api.post<{
        success: boolean;
        data: Property;
      }>("/host/properties", propertyData);
      
      return response.data.data;
    } catch (error) {
      logErrorWithContext("createProperty", error);
      throw error;
    }
  }

  /**
   * Update an existing property
   * 
   * @param propertyData - Property update data including ID
   * @returns Promise<Property> - Updated property
   * @throws Error if update fails
   */
  static async updateProperty(propertyData: UpdatePropertyData): Promise<Property> {
    try {
      const { _id, ...updateData } = propertyData;
      const response = await api.put<{
        success: boolean;
        data: Property;
      }>(`/host/properties/${_id}`, updateData);
      
      return response.data.data;
    } catch (error) {
      logErrorWithContext("updateProperty", error);
      throw error;
    }
  }

  /**
   * Delete a property
   * 
   * @param propertyId - Property identifier
   * @returns Promise<void>
   * @throws Error if deletion fails
   */
  static async deleteProperty(propertyId: string): Promise<void> {
    try {
      await api.delete(`/host/properties/${propertyId}`);
    } catch (error) {
      logErrorWithContext("deleteProperty", error);
      throw error;
    }
  }

  /**
   * Update property status (active, inactive, draft)
   * 
   * @param propertyId - Property identifier
   * @param status - New property status
   * @returns Promise<Property> - Updated property
   * @throws Error if status update fails
   */
  static async updateStatus(propertyId: string, status: "active" | "inactive"): Promise<Property> {
    try {
      // Backend expects isActive boolean in standard update endpoint
      const isActive = status === "active";
      const response = await api.put<{
        success: boolean;
        data: Property;
      }>(`/host/properties/${propertyId}`, { isActive });
      return response.data.data;
    } catch (error) {
      logErrorWithContext("updatePropertyStatus", error);
      throw error;
    }
  }

  /**
   * Upload property images
   * 
   * @param propertyId - Property identifier
   * @param images - Array of image files to upload
   * @returns Promise<string[]> - Array of uploaded image URLs
   * @throws Error if upload fails
   */
  static async uploadImages(propertyId: string, images: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post<{
        success: boolean;
        data: { imageUrls: string[] };
      }>(`/host/properties/${propertyId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data.data.imageUrls;
    } catch (error) {
      logErrorWithContext("uploadPropertyImages", error);
      throw error;
    }
  }

  /**
   * Delete a property image
   * 
   * @param propertyId - Property identifier
   * @param imageId - Image identifier to delete
   * @returns Promise<void>
   * @throws Error if deletion fails
   */
  static async deleteImage(propertyId: string, imageId: string): Promise<void> {
    try {
      await api.delete(`/host/properties/${propertyId}/images/${imageId}`);
    } catch (error) {
      logErrorWithContext("deletePropertyImage", error);
      throw error;
    }
  }

  /**
   * Reorder property images
   * 
   * @param propertyId - Property identifier
   * @param imageOrder - Array of image IDs in desired order
   * @returns Promise<string[]> - Reordered image URLs
   * @throws Error if reordering fails
   */
  static async reorderImages(propertyId: string, imageOrder: string[]): Promise<string[]> {
    try {
      const response = await api.put<{
        success: boolean;
        data: { imageUrls: string[] };
      }>(`/host/properties/${propertyId}/images/reorder`, { imageOrder });
      
      return response.data.data.imageUrls;
    } catch (error) {
      logErrorWithContext("reorderPropertyImages", error);
      throw error;
    }
  }
}

// ========================================
// Legacy Function Exports
// ========================================

/**
 * Get all properties for the current host
 * @deprecated Use HostPropertyService.getProperties instead
 */
export const fetchHostProperties = HostPropertyService.getProperties;

/**
 * Get a specific property by ID
 * @deprecated Use HostPropertyService.getProperty instead
 */
export const fetchHostProperty = HostPropertyService.getProperty;

/**
 * Create a new property
 * @deprecated Use HostPropertyService.createProperty instead
 */
export const createProperty = HostPropertyService.createProperty;

/**
 * Update an existing property
 * @deprecated Use HostPropertyService.updateProperty instead
 */
export const updateProperty = HostPropertyService.updateProperty;

/**
 * Delete a property
 * @deprecated Use HostPropertyService.deleteProperty instead
 */
export const deleteProperty = HostPropertyService.deleteProperty;

/**
 * Update property status
 * @deprecated Use HostPropertyService.updateStatus instead
 */
export const updatePropertyStatus = HostPropertyService.updateStatus;

/**
 * Upload property images
 * @deprecated Use HostPropertyService.uploadImages instead
 */
export const uploadPropertyImages = HostPropertyService.uploadImages;

// Default export
export default HostPropertyService;
