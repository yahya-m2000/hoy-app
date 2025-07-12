/**
 * Property Service
 * 
 * Comprehensive service for property operations including:
 * - Property search and discovery
 * - Property details and availability
 * - Property reviews and host information
 * - Nearby property discovery
 * - Property policies and check-in experiences
 * 
 * @module @core/api/services/property
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { PROPERTY_ENDPOINTS } from "@core/api/endpoints";
import type { 
  PropertyType, 
  ICancellationPolicy,
  IHouseRules,
  ISafetyFeatures,
  ICheckInExperience
} from "@core/types/property.types";
import type { PropertyFormData, Property } from "@core/types";
import { isNetworkError, logErrorWithContext } from "@core/utils/sys/error";
import { addToRetryQueue } from "@core/utils/network";
import { logger } from "@core/utils/sys/log";

// ========================================
// ADDITIONAL TYPE DEFINITIONS
// ========================================

/**
 * Response interfaces for property management operations
 */
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

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Property search filters interface
 */
export interface PropertyFilters {
  /** Search keyword */
  keyword?: string;
  /** Location string (city, country) */
  location?: string;
  /** Country filter */
  country?: string;
  /** City filter */
  city?: string;
  /** State filter */
  state?: string;
  /** Number of guests */
  guests?: number;
  /** Check-in date */
  startDate?: string;
  /** Check-out date */
  endDate?: string;
  /** Minimum price per night */
  minPrice?: number;
  /** Maximum price per night */
  maxPrice?: number;
  /** Property type */
  type?: string;
  /** Required amenities */
  amenities?: string[];
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Number of rooms */
  rooms?: number;
  /** Sort criteria */
  sort?: string;
  /** Latitude for location-based search */
  latitude?: number;
  /** Longitude for location-based search */
  longitude?: number;
  /** Radius for location-based search (km) */
  radius?: number;
  [key: string]: any;
}

/**
 * Coordinate-based search parameters
 */
export interface PropertyCoordinates {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Search radius in kilometers */
  radius?: number;
}

/**
 * Property availability response
 */
export interface PropertyAvailability {
  isAvailable: boolean;
  unavailableDates: {
    startDate: Date;
    endDate: Date;
    reason: "booked" | "blocked" | "maintenance";
    bookingId?: string;
    guestName?: string;
  }[];
  calendar: {
    date: Date;
    isAvailable: boolean;
    price?: number;
    reason?: string;
  }[];
}

// ========================================
// PROPERTY SEARCH SERVICE
// ========================================

/**
 * Service class for property search and discovery operations
 */
export class PropertySearchService {
  // Cache configuration
  private static readonly CACHE_KEYS = {
    FEATURED: '_cachedFeaturedProperties',
    FEATURED_TIME: '_lastFeaturedRequestTime',
    SEARCH: '_propertySearchCache',
    SEARCH_EXPIRY: '_propertySearchCacheExpiry'
  } as const;

  private static readonly CACHE_CONFIG = {
    MIN_REQUEST_INTERVAL: 5000, // 5 seconds
    CACHE_DURATION: 300000, // 5 minutes
    RATE_LIMIT_COOLDOWN: 30000 // 30 seconds after rate limit
  } as const;

  /**
   * Fetch all properties with optional filtering
   * 
   * @param params - Optional filtering parameters
   * @returns Promise<PropertyType[]> - Array of properties
   * @throws Will log error and return empty array on failure
   */
  static async getProperties(params?: PropertyFilters): Promise<PropertyType[]> {
    try {
      const response = await api.get<{ data: PropertyType[] }>("/properties", { params });
      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("PropertySearchService.getProperties", error);

      if (isNetworkError(error)) {
        addToRetryQueue(() => this.getProperties(params));
      }

      return [];
    }
  }

  /**
   * Fetch featured properties with intelligent caching and rate limiting
   * 
   * @returns Promise<PropertyType[]> - Array of featured properties
   * @throws Will log error and return cached/empty array on failure
   */
  static async getFeaturedProperties(): Promise<PropertyType[]> {
    try {
      // Rate limiting check
      const now = Date.now();
      const lastRequestTime = (global as any)[this.CACHE_KEYS.FEATURED_TIME] || 0;

      if (now - lastRequestTime < this.CACHE_CONFIG.MIN_REQUEST_INTERVAL) {
        logger.log("Rate limiting featured properties API calls");
        return (global as any)[this.CACHE_KEYS.FEATURED] || [];
      }

      // Update request timestamp
      (global as any)[this.CACHE_KEYS.FEATURED_TIME] = now;

      const response = await api.get<{ data: PropertyType[] }>(PROPERTY_ENDPOINTS.FEATURED);
      
      logger.log("Featured properties API response status:", response.status);

      if (!response.data?.data) {
        logger.error("Invalid featured properties response structure:", response.data);
        return [];
      }

      // Cache successful response
      (global as any)[this.CACHE_KEYS.FEATURED] = response.data.data;
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("PropertySearchService.getFeaturedProperties", error);

      // Handle rate limiting
      if (error.response?.status === 429) {
        logger.log("Rate limit exceeded for featured properties API");
        (global as any)[this.CACHE_KEYS.FEATURED_TIME] = Date.now() + this.CACHE_CONFIG.RATE_LIMIT_COOLDOWN;
        return (global as any)[this.CACHE_KEYS.FEATURED] || [];
      }

      if (isNetworkError(error)) {
        addToRetryQueue(() => this.getFeaturedProperties());
      }

      return (global as any)[this.CACHE_KEYS.FEATURED] || [];
    }
  }

  /**
   * Search properties with advanced filtering and validation
   * 
   * @param query - Search filters and parameters
   * @returns Promise<PropertyType[]> - Array of matching properties
   * @throws Will log error and return empty array on failure
   */
  static async searchProperties(query: PropertyFilters): Promise<PropertyType[]> {
    try {
      if (!query || Object.keys(query).length === 0) {
        logger.log("Empty search query provided");
        return [];
      }

      const validParams = PropertySearchService.buildSearchParams(query);
      const apiCallId = Date.now().toString().slice(-4);
      
      logger.log(`[${apiCallId}] Property search with params:`, validParams);

      const response = await api.get<{ data: PropertyType[] }>("/properties", {
        params: validParams,
      });

      const properties = response.data.data || [];
      logger.log(`[${apiCallId}] Search returned ${properties.length} properties`);

      return properties;

    } catch (error: any) {
      logErrorWithContext("PropertySearchService.searchProperties", error);

      if (isNetworkError(error)) {
        addToRetryQueue(() => this.searchProperties(query));
      }

      return [];
    }
  }

  /**
   * Find nearby properties using coordinates
   * 
   * @param coords - Geographic coordinates and search radius
   * @returns Promise<PropertyType[]> - Array of nearby properties
   * @throws Will log error and return empty array on failure
   */
  static async getNearbyProperties(coords: PropertyCoordinates): Promise<PropertyType[]> {
    try {
      if (!coords.lat || !coords.lng) {
        throw new Error("Latitude and longitude are required for nearby search");
      }

      const params = {
        lat: coords.lat,
        lng: coords.lng,
        radius: coords.radius || 10, // Default 10km radius
      };

      logger.log("Nearby properties search with coordinates:", params);

      const response = await api.get<{ data: PropertyType[] }>(PROPERTY_ENDPOINTS.NEARBY, { params });
      return response.data.data || [];

    } catch (error: any) {
      logErrorWithContext("PropertySearchService.getNearbyProperties", error);

      if (isNetworkError(error)) {
        addToRetryQueue(() => this.getNearbyProperties(coords));
      }

      return [];
    }
  }

  /**
   * Build and validate search parameters from filter object
   * 
   * @param query - Raw filter parameters
   * @returns Record<string, any> - Validated and cleaned parameters
   * @private
   */
  private static buildSearchParams(query: PropertyFilters): Record<string, any> {
    const validParams: Record<string, any> = {};

    // Text search
    if (query.keyword) validParams.keyword = query.keyword;

    // Location handling
    if (query.location) {
      const locationParts = query.location.split(",").map((part: string) => part.trim());
      if (locationParts.length > 1) {
        validParams.city = locationParts[0];
        validParams.country = locationParts[locationParts.length - 1];
      } else {
        validParams.city = query.location;
        validParams.keyword = validParams.keyword || query.location;
      }
    }

    // Direct location fields
    if (query.country) validParams.country = query.country;
    if (query.city) validParams.city = query.city;
    if (query.state) validParams.state = query.state;

    // Numeric parameters with validation
    if (query.guests && !isNaN(Number(query.guests))) {
      validParams.guests = Number(query.guests);
    }
    if (query.minPrice && !isNaN(Number(query.minPrice))) {
      validParams.minPrice = Number(query.minPrice);
    }
    if (query.maxPrice && !isNaN(Number(query.maxPrice))) {
      validParams.maxPrice = Number(query.maxPrice);
    }

    // Date parameters
    if (query.startDate) validParams.startDate = query.startDate;
    if (query.endDate) validParams.endDate = query.endDate;

    // Other filters
    if (query.type) validParams.propertyType = query.type;
    if (query.amenities) validParams.amenities = query.amenities;

    // Pagination
    if (query.page) validParams.page = Number(query.page);
    if (query.limit) validParams.limit = Number(query.limit);

    return validParams;
  }
}

// ========================================
// PROPERTY DETAILS SERVICE
// ========================================

/**
 * Service class for property details and specific property operations
 */
export class PropertyDetailsService {
  /**
   * Get detailed property information by ID
   * 
   * @param id - Property ID
   * @returns Promise<PropertyType> - Detailed property information
   * @throws Will throw error if property not found or request fails
   */
  static async getPropertyById(id: string): Promise<PropertyType> {
    if (!id) {
      throw new Error("Property ID is required");
    }

    const response = await api.get<{ data: PropertyType }>(PROPERTY_ENDPOINTS.DETAILS(id));
    return response.data.data;
  }

  /**
   * Get property calendar data
   * 
   * @param id - Property ID
   * @returns Promise<any> - Property calendar information
   */
  static async getPropertyCalendar(id: string) {
    if (!id) {
      throw new Error("Property ID is required");
    }

    const response = await api.get<{ data: any }>(PROPERTY_ENDPOINTS.CALENDAR(id));
    return response.data.data;
  }

  /**
   * Get available dates for a property
   * 
   * @param propertyId - Property ID
   * @param period - Number of days to check (default: 90)
   * @returns Promise<any> - Available dates information
   */
  static async getAvailableDates(propertyId: string, period: number = 90) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + period);

    const response = await api.get<{ data: any }>(PROPERTY_ENDPOINTS.AVAILABILITY(propertyId), {
      params: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    });

    return response.data.data;
  }

  /**
   * Get optimal stay periods for a property
   * 
   * @param propertyId - Property ID
   * @returns Promise<any> - Optimal stay period recommendations
   */
  static async getOptimalStayPeriods(propertyId: string) {
    const response = await api.get<{ data: any }>(`/properties/${propertyId}/optimal-stays`);
    return response.data.data;
  }

  /**
   * Get property units/rooms
   * 
   * @param id - Property ID
   * @returns Promise<any> - Property units information
   */
  static async getPropertyUnits(id: string) {
    const response = await api.get<{ data: any }>(PROPERTY_ENDPOINTS.UNITS(id));
    return response.data.data;
  }

  /**
   * Get specific unit details
   * 
   * @param propertyId - Property ID
   * @param unitId - Unit ID
   * @returns Promise<any> - Unit details
   */
  static async getUnitById(propertyId: string, unitId: string) {
    const response = await api.get<{ data: any }>(PROPERTY_ENDPOINTS.UNIT_DETAILS(propertyId, unitId));
    return response.data.data;
  }

  /**
   * Get property reviews
   * 
   * @param id - Property ID
   * @returns Promise<any> - Property reviews
   */
  static async getPropertyReviews(id: string) {
    const response = await api.get<{ data: any }>(PROPERTY_ENDPOINTS.REVIEWS(id));
    return response.data.data;
  }

  /**
   * Get comprehensive property availability
   * 
   * @param propertyId - Property ID
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param unitId - Optional unit ID
   * @returns Promise<PropertyAvailability | null> - Detailed availability information
   */
  static async getPropertyAvailability(
    propertyId: string,
    startDate?: Date,
    endDate?: Date,
    unitId?: string
  ): Promise<PropertyAvailability | null> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];
      if (unitId) params.unitId = unitId;

      const response = await api.get<{ data: PropertyAvailability }>(`/properties/${propertyId}/availability`, { params });
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("PropertyDetailsService.getPropertyAvailability", error);
      return null;
    }
  }
}

// ========================================
// PROPERTY POLICIES SERVICE
// ========================================

/**
 * Service class for property policies and rules
 */
export class PropertyPoliciesService {
  /**
   * Fetch property policies including cancellation, house rules, and safety features
   * 
   * @param propertyId - Property ID
   * @returns Promise with property policies or null
   */
  static async getPropertyPolicies(propertyId: string): Promise<{
    cancellationPolicy: ICancellationPolicy;
    houseRules: IHouseRules;
    safetyFeatures: ISafetyFeatures;
  } | null> {
    try {
      const response = await api.get<{
        data: {
          cancellationPolicy: ICancellationPolicy;
          houseRules: IHouseRules;
          safetyFeatures: ISafetyFeatures;
        };
      }>(`/properties/${propertyId}/policies`);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("PropertyPoliciesService.getPropertyPolicies", error);
      return null;
    }
  }

  /**
   * Fetch property check-in experiences
   * 
   * @param propertyId - Property ID
   * @returns Promise<ICheckInExperience[] | null> - Check-in experience options
   */
  static async getCheckInExperiences(propertyId: string): Promise<ICheckInExperience[] | null> {
    try {
      const response = await api.get<{ data: ICheckInExperience[] }>(`/properties/${propertyId}/check-in-experiences`);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("PropertyPoliciesService.getCheckInExperiences", error);
      return null;
    }
  }
}

// ========================================
// PROPERTY HOST SERVICE
// ========================================

/**
 * Service class for property host-related operations
 */
export class PropertyHostService {
  /**
   * Extract host information from property data
   * 
   * @param property - Property object
   * @returns Host information object
   */
  static getPropertyHostInfo(property: PropertyType) {
    const host = typeof property.host === 'object' ? property.host as any : null;
    
    return {
      id: property.hostId || host?._id || property.host,
      name: host?.name || host?.firstName || "Host",
      photo: host?.photo || host?.profilePicture || host?.avatar,
      joinedDate: host?.joinedDate || host?.createdAt,
      responseRate: host?.responseRate,
      responseTime: host?.responseTime,
      isSuperhost: host?.isSuperhost || host?.isSuperHost,
      isVerified: host?.isVerified || host?.verified,
    };
  }

  /**
   * Fetch comprehensive host information for a property
   * 
   * @param propertyId - Property ID
   * @returns Promise with host information
   */
  static async fetchPropertyHostInfo(propertyId: string) {
    try {
      const response = await api.get<{ data: any }>(`/properties/${propertyId}/host`);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("PropertyHostService.fetchPropertyHostInfo", error);
      throw error;
    }
  }

  /**
   * Get public host profile information
   * 
   * @param hostId - Host ID
   * @returns Promise with public host profile
   */
  static async getPublicHostProfile(hostId: string) {
    try {
      const response = await api.get<{ data: any }>(`/hosts/${hostId}/public-profile`);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("PropertyHostService.getPublicHostProfile", error);
      throw error;
    }
  }
}

// ========================================
// PROPERTY MANAGEMENT SERVICE
// ========================================

/**
 * Service class for host property management operations (CRUD)
 */
export class PropertyManagementService {
  /**
   * Get all properties for the authenticated host
   * 
   * @returns Promise<Property[]> - Array of host properties
   * @throws Will throw error if request fails
   */
  static async getHostProperties(): Promise<Property[]> {
    const response = await api.get<GetPropertiesResponse>("/host/properties");
    return response.data.data.properties;
  }

  /**
   * Get a specific property by ID (host access)
   * 
   * @param id - Property ID
   * @returns Promise<Property> - Property details
   * @throws Will throw error if property not found or request fails
   */
  static async getProperty(id: string): Promise<Property> {
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
   * 
   * @param propertyData - Property form data
   * @returns Promise<Property> - Created property
   * @throws Will throw error if creation fails
   */
  static async createProperty(propertyData: PropertyFormData): Promise<Property> {
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
   * 
   * @param id - Property ID
   * @param propertyData - Partial property form data
   * @returns Promise<Property> - Updated property
   * @throws Will throw error if update fails
   */
  static async updateProperty(
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
   * 
   * @param id - Property ID
   * @returns Promise<void>
   * @throws Will throw error if deletion fails
   */
  static async deleteProperty(id: string): Promise<void> {
    await api.delete(`/host/properties/${id}`);
  }

  /**
   * Upload property images (deprecated - use UploadService.uploadPropertyImages instead)
   * 
   * @param propertyId - Property ID
   * @param images - Form data containing images
   * @returns Promise<string[]> - Array of uploaded image URLs
   * @throws Will throw error if upload fails
   * @deprecated Use UploadService.uploadPropertyImages for better file organization
   */
  static async uploadPropertyImages(
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

// ========================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================

// Export individual functions for backward compatibility
export const getProperties = PropertySearchService.getProperties;
export const getFeaturedProperties = PropertySearchService.getFeaturedProperties;
export const searchProperties = PropertySearchService.searchProperties;
export const getNearbyProperties = PropertySearchService.getNearbyProperties;
export const getPropertyById = PropertyDetailsService.getPropertyById;
export const getPropertyCalendar = PropertyDetailsService.getPropertyCalendar;
export const getAvailableDates = PropertyDetailsService.getAvailableDates;
export const getPropertyUnits = PropertyDetailsService.getPropertyUnits;
export const getUnitById = PropertyDetailsService.getUnitById;
export const getPropertyReviews = PropertyDetailsService.getPropertyReviews;
export const getPropertyHostInfo = PropertyHostService.getPropertyHostInfo;
export const fetchPropertyHostInfo = PropertyHostService.fetchPropertyHostInfo;
export const getPublicHostProfile = PropertyHostService.getPublicHostProfile;

// Property management exports (from PropertyManagementService)
export const getHostProperties = PropertyManagementService.getHostProperties;
export const getHostProperty = PropertyManagementService.getProperty;
export const createProperty = PropertyManagementService.createProperty;
export const updateProperty = PropertyManagementService.updateProperty;
export const deleteProperty = PropertyManagementService.deleteProperty;
export const uploadPropertyImages = PropertyManagementService.uploadPropertyImages;
