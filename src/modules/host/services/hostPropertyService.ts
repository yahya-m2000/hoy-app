/**
 * Host property management service
 * Handles CRUD operations for host properties
 */

import api from "@shared/services/core/client";
import { Property } from "@shared/types/property";
import { logErrorWithContext } from "@shared/utils/error";

export interface CreatePropertyData {
  name: string;
  type: string; // Required field matching server schema
  propertyType: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number; // Required field matching server schema
  bathrooms: number;
  price: number; // Should be number, not object
  currency: string;
  images?: string[];
  houseRules?: any;
  safetyFeatures?: any;
  cancellationPolicy?: any;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  _id: string;
}

export interface HostPropertyFilters {
  status?: string;
  propertyType?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all properties for the current host
 */
export const fetchHostProperties = async (
  filters?: HostPropertyFilters
): Promise<{
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    console.log("fetchHostProperties called with filters:", filters);
    const response = await api.get<{
      success: boolean;
      data: {
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>("/host/properties", { params: filters });
    console.log("fetchHostProperties response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("fetchHostProperties error:", error);
    logErrorWithContext("fetchHostProperties", error);
    throw error;
  }
};

/**
 * Get a specific property by ID for the current host
 */
export const fetchHostProperty = async (
  propertyId: string
): Promise<Property> => {
  try {
    const response = await api.get<{ success: boolean; data: Property }>(
      `/host/properties/${propertyId}`
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchHostProperty", error);
    throw error;
  }
};

/**
 * Create a new property
 */
export const createProperty = async (
  propertyData: CreatePropertyData
): Promise<Property> => {
  try {
    const response = await api.post<{ success: boolean; data: Property }>(
      "/host/properties",
      propertyData
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("createProperty", error);
    throw error;
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (
  propertyData: UpdatePropertyData
): Promise<Property> => {
  try {
    const { _id, ...updateData } = propertyData;
    const response = await api.put<{ success: boolean; data: Property }>(
      `/host/properties/${_id}`,
      updateData
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("updateProperty", error);
    throw error;
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    await api.delete(`/host/properties/${propertyId}`);
  } catch (error) {
    logErrorWithContext("deleteProperty", error);
    throw error;
  }
};

/**
 * Update property status (active, inactive, draft)
 */
export const updatePropertyStatus = async (
  propertyId: string,
  status: string
): Promise<Property> => {
  try {
    const response = await api.patch<{ success: boolean; data: Property }>(
      `/host/properties/${propertyId}/status`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("updatePropertyStatus", error);
    throw error;
  }
};

/**
 * Upload property images
 */
export const uploadPropertyImages = async (
  propertyId: string,
  images: File[]
): Promise<string[]> => {
  try {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
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
};
