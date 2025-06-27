import api from "@shared/services/core/client";
import { Property, PropertyFormData } from "../utils/types";

export interface CreatePropertyResponse {
  success: boolean;
  data: Property;
}

export interface GetPropertiesResponse {
  success: boolean;
  data: {
    properties: Property[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PropertyResponse {
  success: boolean;
  data: Property;
}

export class PropertyService {
  /**
   * Get all properties for the authenticated host
   */
  async getHostProperties(): Promise<Property[]> {
    const response = await api.get<GetPropertiesResponse>("/host/properties");

    return response.data.data.properties;
  }
  /**
   * Get a specific property by ID
   */
  async getProperty(id: string): Promise<Property> {
    const response = await api.get<Property | PropertyResponse>(
      `/host/properties/${id}`
    );

    // The host property details endpoint returns the property directly,
    // not wrapped in a standard response format
    if (
      response.data &&
      typeof response.data === "object" &&
      "_id" in response.data
    ) {
      // Direct property response
      return response.data as Property;
    } else if (response.data && "data" in response.data) {
      // Standard wrapped response
      return (response.data as PropertyResponse).data;
    } else {
      throw new Error("Invalid response format");
    }
  }
  /**
   * Create a new property
   */
  async createProperty(propertyData: PropertyFormData): Promise<Property> {
    // Ensure coordinates are included (use default if not provided)
    const dataWithCoordinates = {
      ...propertyData,
      coordinates: propertyData.coordinates || {
        latitude: 0, // Default coordinates - should be replaced with geocoding
        longitude: 0,
      },
    };

    const response = await api.post<CreatePropertyResponse>(
      "/host/properties",
      dataWithCoordinates
    );
    return response.data.data;
  }

  /**
   * Update an existing property
   */ async updateProperty(
    id: string,
    propertyData: Partial<PropertyFormData>
  ): Promise<Property> {
    const response = await api.put<PropertyResponse>(
      `/host/properties/${id}`,
      propertyData
    );
    return response.data.data;
  }

  /**
   * Delete a property
   */ async deleteProperty(id: string): Promise<void> {
    await api.delete(`/host/properties/${id}`);
  }
  /**
   * Upload property images
   */ async uploadPropertyImages(
    propertyId: string,
    images: FormData
  ): Promise<string[]> {
    const response = await api.post<{
      success: boolean;
      data: { urls: string[] };
    }>(`/properties/${propertyId}/photos`, images, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data.urls;
  }
}
