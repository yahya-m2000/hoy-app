/**
 * Geocoding Service
 * Handles location search and geocoding using MapBox API
 */

import Constants from "expo-constants";
import axios from "axios";

// Get the MapBox API key from app.json
const MAPBOX_API_KEY = Constants.expoConfig?.extra?.mapboxApiKey || "";

// API request tracking with global cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between requests
const locationCache: { [key: string]: LocationResult[] } = {};

// Define types for Mapbox API response
interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  place_type: string[];
  context?: {
    id: string;
    text: string;
  }[];
}

interface MapboxResponse {
  features: MapboxFeature[];
  type: string;
}

export interface LocationResult {
  id: string;
  city: string;
  country: string;
  fullName: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

/**
 * Search for locations using MapBox Geocoding API
 * @param query Search term (e.g. "London", "New York", etc.)
 * @returns List of matching locations
 */
export const searchLocations = async (
  query: string
): Promise<LocationResult[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  // Check cache first
  const normalizedQuery = query.toLowerCase().trim();
  if (locationCache[normalizedQuery]) {
    console.log(`Using cached results for "${normalizedQuery}"`);
    return locationCache[normalizedQuery];
  }

  // Implement rate limiting
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    console.log("Geocoding API: Rate limiting in effect");

    // Try to find partial matches in cache
    for (const cachedQuery in locationCache) {
      if (
        cachedQuery.includes(normalizedQuery) ||
        normalizedQuery.includes(cachedQuery)
      ) {
        console.log(`Using similar cached results for "${normalizedQuery}"`);
        return locationCache[cachedQuery];
      }
    }

    // Return popular destinations as fallback
    return getPopularDestinations().slice(0, 3);
  }

  lastRequestTime = now;
  try {
    // Call MapBox Geocoding API with the query
    console.log(`Calling Mapbox API for "${normalizedQuery}"`);
    const response = await axios.get<MapboxResponse>(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json`,
      {
        params: {
          access_token: MAPBOX_API_KEY,
          types: "place,locality,neighborhood,address",
          limit: 10,
        },
        timeout: 10000, // 10 seconds timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Mapbox API response status: ${response.status}`);

    if (!response.data || !response.data.features) {
      console.log("No features in Mapbox response");
      return [];
    }

    // Map the response to our app's location format
    const results = response.data.features.map((feature: MapboxFeature) => {
      // Extract city and country from place name
      const placeParts = feature.place_name.split(", ");
      const city = placeParts[0];
      const country = placeParts[placeParts.length - 1];
      return {
        id: feature.id,
        city,
        country,
        fullName: feature.place_name,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
      };
    });

    // Store in cache for future use
    locationCache[normalizedQuery] = results;

    // Limit cache size to prevent memory issues
    const cacheKeys = Object.keys(locationCache);
    if (cacheKeys.length > 20) {
      delete locationCache[cacheKeys[0]];
    }

    return results;
  } catch (error: any) {
    console.error("Error searching for locations:", error);

    // Handle rate limiting specifically
    if (error.response && error.response.status === 429) {
      console.log("Rate limit exceeded for location search API");
      // Set a longer cooldown period after hitting rate limit
      lastRequestTime = Date.now() + 30000; // 30 second cooldown

      // Look for something in cache that might be relevant
      for (const cachedQuery in locationCache) {
        if (
          cachedQuery.includes(normalizedQuery) ||
          normalizedQuery.includes(cachedQuery)
        ) {
          return locationCache[cachedQuery];
        }
      }

      return getPopularDestinations(); // Return all popular destinations as fallback
    }

    // Log specific error information when available
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }
    return getPopularDestinations().slice(0, 3); // Return top 3 popular destinations
  }
};

/**
 * Get popular destinations for the initial screen
 * @returns List of popular destinations
 */
export const getPopularDestinations = (): LocationResult[] => {
  // You could potentially fetch this from your backend API instead
  return [
    {
      id: "1",
      city: "New York",
      country: "United States",
      fullName: "New York, United States",
      coordinates: { longitude: -74.006, latitude: 40.7128 },
    },
    {
      id: "2",
      city: "London",
      country: "United Kingdom",
      fullName: "London, United Kingdom",
      coordinates: { longitude: -0.1278, latitude: 51.5074 },
    },
    {
      id: "3",
      city: "Paris",
      country: "France",
      fullName: "Paris, France",
      coordinates: { longitude: 2.3522, latitude: 48.8566 },
    },
    {
      id: "4",
      city: "Tokyo",
      country: "Japan",
      fullName: "Tokyo, Japan",
      coordinates: { longitude: 139.6503, latitude: 35.6762 },
    },
    {
      id: "5",
      city: "Sydney",
      country: "Australia",
      fullName: "Sydney, Australia",
      coordinates: { longitude: 151.2093, latitude: -33.8688 },
    },
    {
      id: "6",
      city: "Dubai",
      country: "United Arab Emirates",
      fullName: "Dubai, United Arab Emirates",
      coordinates: { longitude: 55.2708, latitude: 25.2048 },
    },
  ];
};
