/**
 * Search Service
 * 
 * Comprehensive search operations including:
 * - Advanced property search
 * - Location suggestions and autocomplete
 * - Trending searches
 * - Search history management
 * 
 * @module @core/api/services/search
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import type { PropertyType } from "@core/types/property.types";
import { logger } from "@core/utils/sys/log";

// ========================================
// Type Definitions
// ========================================

/**
 * Advanced search filters interface
 */
export interface SearchFilters {
  /** Search keyword */
  keyword?: string;
  /** Location query */
  location?: string;
  /** Country filter */
  country?: string;
  /** City filter */
  city?: string;
  /** State/region filter */
  state?: string;
  /** Number of guests */
  guests?: number;
  /** Check-in date */
  checkIn?: string;
  /** Check-out date */
  checkOut?: string;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Property type */
  propertyType?: string;
  /** Required amenities */
  amenities?: string[];
  /** Sort criteria */
  sort?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  [key: string]: any;
}

/**
 * Location suggestion structure
 */
export interface LocationSuggestion {
  /** Suggestion ID */
  id: string;
  /** Display name */
  name: string;
  /** Suggestion type (city, region, country) */
  type: string;
  /** Country code */
  country?: string;
  /** State/region */
  state?: string;
  /** Geographic coordinates */
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Trending search item
 */
export interface TrendingSearch {
  /** Search query */
  query: string;
  /** Search count */
  count: number;
  /** Search trend direction */
  trend: 'up' | 'down' | 'stable';
}

/**
 * Search results response
 */
export interface SearchResults {
  /** Array of matching properties */
  properties: PropertyType[];
  /** Total number of results */
  total: number;
  /** Current page */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Applied filters */
  filters: SearchFilters;
}

// ========================================
// Search Service
// ========================================

/**
 * Main search service class
 */
export class SearchService {
  /**
   * Perform advanced property search with comprehensive filtering
   * 
   * @param filters - Search filters and criteria
   * @returns Promise<SearchResults> - Search results with pagination
   * @throws Error if search fails
   */
  static async searchProperties(filters: SearchFilters): Promise<SearchResults> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          properties: PropertyType[];
          total: number;
          page: number;
          totalPages: number;
          filters: SearchFilters;
        };
      }>("/search", { params: filters });

      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("searchProperties", error);
      
      // Return empty results on error to prevent app crashes
      return {
        properties: [],
        total: 0,
        page: 1,
        totalPages: 0,
        filters: filters,
      };
    }
  }

  /**
   * Get location suggestions for autocomplete
   * 
   * @param query - Location search query
   * @returns Promise<LocationSuggestion[]> - Array of location suggestions
   */
  static async getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await api.get<{
        success: boolean;
        data: LocationSuggestion[];
      }>("/search/suggestions", {
        params: { query: query.trim() },
      });

      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getLocationSuggestions", error);
      return [];
    }
  }

  /**
   * Get nearby properties (currently disabled)
   * 
   * @param coords - Geographic coordinates
   * @returns Promise<PropertyType[]> - Array of nearby properties
   * @deprecated Coordinate-based search disabled due to geospatial query issues
   */
  static async getNearbyProperties(coords: {
    lat: number;
    lng: number;
    radius?: number;
  }): Promise<PropertyType[]> {
    // Disabled coordinate-based search to avoid geospatial query issues
    logger.log("Nearby search disabled - coordinates ignored:", coords);
    return [];
  }

  /**
   * Get trending searches and popular destinations
   * 
   * @returns Promise<TrendingSearch[]> - Array of trending searches
   */
  static async getTrendingSearches(): Promise<TrendingSearch[]> {
    try {
      const response = await api.get<{
        success: boolean;
        data: TrendingSearch[];
      }>("/search/trending");

      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getTrendingSearches", error);
      return [];
    }
  }

  /**
   * Get search suggestions based on partial query
   * 
   * @param query - Partial search query
   * @returns Promise<string[]> - Array of search suggestions
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await api.get<{
        success: boolean;
        data: string[];
      }>("/search/suggestions/queries", {
        params: { query: query.trim() },
      });

      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getSearchSuggestions", error);
      return [];
    }
  }

  /**
   * Save search to user's search history
   * 
   * @param searchQuery - Search query to save
   * @param filters - Applied filters
   * @returns Promise<void>
   */
  static async saveSearchToHistory(searchQuery: string, filters: SearchFilters): Promise<void> {
    try {
      await api.post("/search/history", {
        query: searchQuery,
        filters: filters,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // Log error but don't throw - search history is not critical
      logErrorWithContext("saveSearchToHistory", error);
    }
  }

  /**
   * Get user's search history
   * 
   * @param limit - Maximum number of items to return
   * @returns Promise<Array> - Array of saved searches
   */
  static async getSearchHistory(limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>("/search/history", {
        params: { limit },
      });

      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getSearchHistory", error);
      return [];
    }
  }

  /**
   * Clear user's search history
   * 
   * @returns Promise<void>
   */
  static async clearSearchHistory(): Promise<void> {
    try {
      await api.delete("/search/history");
    } catch (error: any) {
      logErrorWithContext("clearSearchHistory", error);
      throw error;
    }
  }
}

// ========================================
// Legacy Function Exports
// ========================================

/**
 * Advanced property search
 * @deprecated Use SearchService.searchProperties instead
 */
export const searchPropertiesAdvanced = SearchService.searchProperties;

/**
 * Get location suggestions
 * @deprecated Use SearchService.getLocationSuggestions instead
 */
export const getLocationSuggestions = SearchService.getLocationSuggestions;

/**
 * Get nearby search results
 * @deprecated Use SearchService.getNearbyProperties instead
 */
export const getNearbySearch = SearchService.getNearbyProperties;

/**
 * Get trending searches
 * @deprecated Use SearchService.getTrendingSearches instead
 */
export const getTrendingSearches = SearchService.getTrendingSearches;

// Default export
export default SearchService;
