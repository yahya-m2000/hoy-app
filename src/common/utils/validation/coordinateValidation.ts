/**
 * Utility functions for validating and formatting coordinate parameters
 */

/**
 * Validates if the given coordinates are valid (within proper latitude/longitude ranges)
 */
export const isValidCoordinates = (lat?: number, lng?: number): boolean => {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return false;
  }

  // Valid latitude range: -90 to 90
  // Valid longitude range: -180 to 180
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Formats coordinate parameters for API requests
 * Returns the validated and formatted coordinate parameters or null if invalid
 */
export const formatCoordinateParams = (
  latitude: number | string | undefined,
  longitude: number | string | undefined,
  radius?: number | string
): { latitude: number; longitude: number; radius: number } | null => {
  try {
    // Convert parameters to numbers
    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lng =
      typeof longitude === "string" ? parseFloat(longitude) : longitude;
    const rad = typeof radius === "string" ? parseFloat(radius) : radius || 10;

    // Validate coordinates
    if (!isValidCoordinates(lat, lng)) {
      console.warn("Invalid coordinates:", { latitude, longitude });
      return null;
    }

    // Validate radius
    const validRadius = !isNaN(rad) ? Math.max(0.1, Math.min(100, rad)) : 10;

    return {
      latitude: lat!,
      longitude: lng!,
      radius: validRadius,
    };
  } catch (error) {
    console.error("Error formatting coordinate parameters:", error);
    return null;
  }
};
