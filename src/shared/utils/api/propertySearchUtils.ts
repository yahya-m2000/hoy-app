/**
 * Utility for handling coordinate-based property searches.
 * Ensures validation and proper error handling.
 */

import { searchProperties } from "@shared/services/api/properties";
import { formatCoordinateParams } from "../validation/coordinateValidation";

/**
 * Performs a validated coordinate-based property search
 *
 * @param latitude The latitude coordinate
 * @param longitude The longitude coordinate
 * @param radius Optional search radius in km (default 10)
 * @param additionalParams Any additional search parameters to include
 * @returns The search results or an empty array if validation fails
 */
export const searchWithCoordinates = async (
  latitude: number | string | undefined,
  longitude: number | string | undefined,
  radius: number | string = 10,
  additionalParams: Record<string, any> = {}
) => {
  try {
    // Validate coordinates first
    const validCoords = formatCoordinateParams(latitude, longitude, radius);

    if (!validCoords) {
      console.error("Invalid coordinates provided for search:", {
        latitude,
        longitude,
        radius,
      });
      return [];
    }

    // Create search query with validated coordinates
    const searchQuery = {
      ...additionalParams,
      latitude: validCoords.latitude,
      longitude: validCoords.longitude,
      radius: validCoords.radius,
    };

    console.log("Performing coordinate-based search with params:", searchQuery);

    // Execute the search
    const results = await searchProperties(searchQuery);

    return results;
  } catch (error: any) {
    console.error("Error in coordinate search:", error);

    // Add detailed error logging for API errors
    if (error?.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Special handling for common error types
      if (error.response.status === 404) {
        console.error("404 Not Found: Check API endpoint path");
      } else if (error.response.status === 400) {
        console.error("400 Bad Request: Invalid search parameters");
      }
    }

    return [];
  }
};
