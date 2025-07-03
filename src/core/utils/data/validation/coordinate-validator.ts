/**
 * Coordinate Validation Utilities
 *
 * Utilities for validating and formatting geographical coordinates
 * including latitude, longitude, and radius validation.
 * 
 * @module @core/utils/validation/coordinate-validation
 * @author Hoy Development Team
 * @version 1.0.0
 */

/**
 * Validate latitude coordinate
 * @param lat Latitude value to validate
 * @returns Boolean indicating if latitude is valid
 */
export const isValidLatitude = (lat: number | string): boolean => {
  const num = typeof lat === "string" ? parseFloat(lat) : lat;
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude coordinate  
 * @param lng Longitude value to validate
 * @returns Boolean indicating if longitude is valid
 */
export const isValidLongitude = (lng: number | string): boolean => {
  const num = typeof lng === "string" ? parseFloat(lng) : lng;
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Format and validate coordinate parameters for API calls
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate  
 * @param radius Search radius in kilometers
 * @returns Formatted coordinates object or null if invalid
 */
export const formatCoordinateParams = (
  latitude: number | string | undefined,
  longitude: number | string | undefined, 
  radius?: number | string
): { latitude: number; longitude: number; radius: number } | null => {
  const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  const lng =
    typeof longitude === "string" ? parseFloat(longitude) : longitude;
  const rad = typeof radius === "string" ? parseFloat(radius) : radius || 10;

  if (!isValidLatitude(lat!) || !isValidLongitude(lng!)) {
    return null;
  }

  return {
    latitude: lat!,
    longitude: lng!,
    radius: Math.max(1, Math.min(rad, 100)), // Clamp radius between 1-100km
  };
};

/**
 * Calculate distance between two coordinate points using Haversine formula
 * @param lat1 First point latitude
 * @param lng1 First point longitude
 * @param lat2 Second point latitude
 * @param lng2 Second point longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}; 