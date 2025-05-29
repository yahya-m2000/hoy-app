/**
 * Custom hooks to fetch and filter properties based on search criteria
 * Handles fetching data from the API, loading states, and error handling
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { PropertyType } from "../../common/types/property";
import {
  fetchFeaturedProperties as fetchFeaturedPropertiesApi,
  searchProperties as searchPropertiesApi,
} from "../services/propertyService";

// Simple cache for properties
const propertyCache: Record<string, PropertyType[]> = {};

// Function to transform API property data to match the app's expected data structure
const transformPropertyData = (apiProperty: any): PropertyType => {
  // Calculate average rating if reviews exist
  const rating =
    apiProperty.rating !== undefined
      ? apiProperty.rating
      : apiProperty.reviews?.length > 0
      ? apiProperty.reviews.reduce(
          (sum: number, review: any) => sum + (review.rating || 0),
          0
        ) / apiProperty.reviews.length
      : 0;

  // Extract the first unit price or default to 0
  const price =
    apiProperty.price !== undefined
      ? apiProperty.price
      : apiProperty.units && apiProperty.units.length > 0
      ? apiProperty.units[0].price || 0
      : 0;

  // Transform property data structure
  return {
    _id: apiProperty._id,
    title: apiProperty.name, // API uses 'name' instead of 'title'
    description: apiProperty.description,
    images: apiProperty.photos || apiProperty.images || [], // Check both photos and images arrays
    price: apiProperty.price || price, // Use direct price if available, otherwise calculate from units
    currency: apiProperty.currency || "USD", // Use provided currency or default
    location: `${apiProperty.address?.city || ""}, ${
      apiProperty.address?.country || ""
    }`,
    city: apiProperty.address?.city,
    country: apiProperty.address?.country,
    address: apiProperty.address?.street,
    rating: rating,
    reviewCount: apiProperty.reviews?.length || 0,
    isSuperHost: apiProperty.isSuperHost || false, // Use provided value if available
    isWishlisted: apiProperty.isWishlisted || false, // Use provided value if available
    amenities: apiProperty.commonAmenities || apiProperty.amenities || [],
    bedrooms: apiProperty.units?.[0]?.bedrooms || 1,
    beds: apiProperty.units?.[0]?.beds || 1,
    bathrooms: apiProperty.units?.[0]?.bathrooms || 1,
    maxGuests: apiProperty.maxGuests || apiProperty.units?.[0]?.maxGuests || 2,
    coordinates:
      apiProperty.coordinates ||
      (apiProperty.location?.coordinates
        ? {
            latitude: apiProperty.location.coordinates[1], // GeoJSON uses [longitude, latitude]
            longitude: apiProperty.location.coordinates[0],
          }
        : undefined),
    hostId: apiProperty.hostId,
    hostName: "", // Not provided in API response
    hostImage: "", // Not provided in API response
  };
};

// Define search parameters interface
export interface SearchParams {
  location?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  rooms?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  sort?: {
    field: "createdAt" | "rating" | "price" | "distance";
    order: "asc" | "desc";
  };
}

// Interface for the hook return values
export interface PropertiesHookReturn {
  properties: PropertyType[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
}

// Optional configuration options for the hook
export interface PropertiesHookOptions {
  stableKey?: string; // Unique identifier to prevent re-fetching
}

/**
 * Hook for getting featured properties
 * Used on the home page to display featured listings
 */
export function useFeaturedProperties(): PropertiesHookReturn {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const lastRequestTimeRef = useRef(0);
  const MIN_REQUEST_INTERVAL = 800; // ms between featured property requests

  const fetchProperties = useCallback(async () => {
    // Apply consistent throttling - only proceed if minimum interval has elapsed
    const now = Date.now();
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      console.log(
        "Throttling featured properties request - enforcing minimum interval"
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          MIN_REQUEST_INTERVAL - (now - lastRequestTimeRef.current)
        )
      );
    }

    // Update last request time
    lastRequestTimeRef.current = Date.now();

    setLoading(true);
    setError(null);
    try {
      // Fetch featured properties from API
      const apiProperties = await fetchFeaturedPropertiesApi();

      if (isMountedRef.current) {
        console.log(
          "Featured API response:",
          JSON.stringify(apiProperties[0], null, 2)
        );

        // Transform API data to match app's expected structure
        const featuredProperties = apiProperties.map(transformPropertyData);

        console.log(
          "Transformed featured property:",
          JSON.stringify(featuredProperties[0], null, 2)
        );

        setProperties(featuredProperties);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching featured properties:", err);

      if (isMountedRef.current) {
        let errorMessage = "Unable to load featured properties";

        if (err instanceof Error) {
          if (err.message.includes("Network Error")) {
            errorMessage =
              "Network connection error. Please check your internet connection and try again.";
          } else {
            errorMessage = err.message;
          }

          // Extract API error messages if available
          if (typeof err === "object" && err !== null && "response" in err) {
            const response = (err as any).response;
            if (response?.data?.message) {
              errorMessage = response.data.message;
            }
          }
        }

        setError(errorMessage);
        setProperties([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProperties();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProperties]);

  return { properties, loading, error, fetchProperties };
}

/**
 * Hook for searching properties based on criteria
 * Used on the search results page
 */
export function useProperties(
  params: SearchParams = {},
  options: PropertiesHookOptions = {}
): PropertiesHookReturn {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add these to track request frequency
  const requestCountRef = useRef(0);
  const lastRequestTimeRef = useRef(Date.now());
  // Different intervals for different search types
  const MIN_REQUEST_INTERVAL = params.sort?.field === "rating" ? 500 : 2000; // 0.5s for top rated, 2s for others

  const isMountedRef = useRef(true);
  // Add a loading flag control state to prevent excessive fetching
  const hasFetchedRef = useRef<boolean>(false);

  // Use a stable key for instances that need to persist between re-renders
  const stableKey = options.stableKey;

  // Initialize on first render
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Create a memoized search query object
  const searchQuery = useMemo(() => {
    const query: Record<string, any> = {};

    // Enhanced location handling
    if (params.location && params.location.trim() !== "") {
      // Use location as a keyword for searching
      query.keyword = params.location;

      // Split location string to extract parts
      const locationParts = params.location
        .split(",")
        .map((part: string) => part.trim());

      // If we have multiple parts, use the first as city and last as country
      if (locationParts.length > 1) {
        query.city = locationParts[0];
        query.country = locationParts[locationParts.length - 1];
      }
    }

    // Add explicit city/country if provided
    if (params.city) query.city = params.city;
    if (params.country) query.country = params.country;

    // Add coordinates-based search if available
    if (params.coordinates) {
      query.latitude = params.coordinates.latitude;
      query.longitude = params.coordinates.longitude;
      if (params.coordinates.radius) {
        query.radius = params.coordinates.radius;
      } else {
        query.radius = 10; // Default 10km radius
      }
    }

    // The API expects 'type', not 'propertyType'
    if (params.propertyType && params.propertyType.trim() !== "") {
      query.type = params.propertyType;
    }

    if (typeof params.guests === "number" && params.guests > 0) {
      query.guests = params.guests;
    }

    if (typeof params.minPrice === "number" && params.minPrice > 0) {
      query.minPrice = params.minPrice;
    }

    if (typeof params.maxPrice === "number" && params.maxPrice > 0) {
      query.maxPrice = params.maxPrice;
    }

    // Format dates properly for API
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      if (!isNaN(startDate.getTime())) {
        query.startDate = startDate.toISOString().split("T")[0];
      }
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      if (!isNaN(endDate.getTime())) {
        query.endDate = endDate.toISOString().split("T")[0];
      }
    }

    if (params.amenities && params.amenities.length > 0) {
      query.amenities = params.amenities.join(",");
    }

    // Add sort parameter if specified
    if (params.sort) {
      query.sort = `${params.sort.field}_${params.sort.order}`;
    }

    return query;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.location,
    params.city,
    params.country,
    params.propertyType,
    params.guests,
    params.minPrice,
    params.maxPrice,
    params.startDate,
    params.endDate,
    params.amenities,
    params.rooms,
    params.sort,
    params.coordinates?.latitude,
    params.coordinates?.longitude,
    params.coordinates?.radius,
  ]);

  // Function to fetch properties based on search params
  const fetchProperties = useCallback(async (): Promise<void> => {
    // Skip if component is unmounted
    if (!isMountedRef.current) {
      return Promise.resolve();
    }

    // Rate limiting to prevent excessive API calls
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.log(
        `Throttling API request - delaying by ${
          MIN_REQUEST_INTERVAL - timeSinceLastRequest
        }ms`
      );
      // Wait for the minimum interval before proceeding
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }

    // Update tracking after any enforced delay
    lastRequestTimeRef.current = Date.now();
    requestCountRef.current += 1;

    // Double-check component is still mounted after any delay
    if (!isMountedRef.current) {
      return Promise.resolve();
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching properties with params:", searchQuery);

      // Check if we have meaningful search parameters
      const hasParams = Object.keys(searchQuery).length > 0;
      const hasCoordinates = params.coordinates !== undefined;

      // If there are no search parameters but coordinates exist, use nearby endpoint
      if (!hasParams && hasCoordinates && params.coordinates) {
        console.log(
          "Using nearby search with coordinates:",
          params.coordinates
        );

        // Here we would call a different API endpoint for nearby properties
        // For now we'll use the regular search with coordinates only
        const nearbyParams = {
          latitude: params.coordinates.latitude,
          longitude: params.coordinates.longitude,
          radius: params.coordinates.radius || 10,
        };

        console.log("Nearby search params:", nearbyParams);
        const properties = await searchPropertiesApi(nearbyParams);

        if (isMountedRef.current) {
          console.log(`Found ${properties.length} nearby properties`);
          if (properties.length > 0) {
            console.log("First nearby property:", properties[0]._id);
          }

          // Transform the API data
          const transformedProperties = properties.map(transformPropertyData);
          setProperties(transformedProperties);

          // Also update the cache if we have a stable key
          if (stableKey) {
            propertyCache[stableKey] = transformedProperties;
            console.log(
              `Updated cache for ${stableKey} with ${transformedProperties.length} nearby properties`
            );
          }
        }
      } else {
        // Normal search with parameters
        console.log(
          "Final search query:",
          JSON.stringify(searchQuery, null, 2)
        );
        const properties = await searchPropertiesApi(searchQuery); // We need to transform the data before storing it
        const transformedProperties = properties.map(transformPropertyData);

        if (isMountedRef.current) {
          console.log(
            `Found ${transformedProperties.length} matching properties`
          );
          if (transformedProperties.length > 0) {
            console.log(
              "First property data example:",
              transformedProperties[0]._id
            );
          }

          setProperties(transformedProperties);

          // Also update the cache if we have a stable key
          if (stableKey) {
            propertyCache[stableKey] = transformedProperties;
            console.log(
              `Updated cache for ${stableKey} with ${transformedProperties.length} properties`
            );
          }
        }
      }

      if (isMountedRef.current) {
        setError(null);
      }
    } catch (err) {
      console.error("Error searching properties:", err);

      if (isMountedRef.current) {
        let errorMessage = "Unable to connect to server";

        if (err instanceof Error) {
          if (err.message.includes("Network Error")) {
            errorMessage =
              "Network connection error. Please check your internet connection and try again.";
          } else if (err.message.includes("429")) {
            errorMessage = "Too many requests. Please try again later.";
          } else {
            errorMessage = err.message;
          }

          // Extract API error messages if available
          if (typeof err === "object" && err !== null && "response" in err) {
            const response = (err as any).response;
            if (response?.data?.message) {
              errorMessage = response.data.message;
            } else if (response?.data?.errors) {
              errorMessage += ": " + JSON.stringify(response.data.errors);
            }
          }
        }

        setError(errorMessage);
        setProperties([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, params.coordinates, MIN_REQUEST_INTERVAL, stableKey]);

  // Cache fetched results for stable keys
  React.useEffect(() => {
    // Skip if no stable key provided
    if (!stableKey) return;

    // Look up cached data
    const cachedData = propertyCache[stableKey];
    if (cachedData && cachedData.length > 0) {
      console.log(
        `Using cached data for ${stableKey} (${cachedData.length} properties)`
      );
      setProperties(cachedData);
      setLoading(false);
      hasFetchedRef.current = true;
    }
  }, [stableKey]);

  // Fetch properties on mount only for specific query types
  useEffect(() => {
    // Define a special variable to track if this is a top-rated query
    const isTopRated =
      params.sort?.field === "rating" && params.sort?.order === "desc";

    // Skip refetching for top-rated queries that have already loaded
    if (isTopRated && hasFetchedRef.current && properties.length > 0) {
      return;
    }

    // Add some logging to debug search params
    console.log(
      `Initializing ${
        isTopRated ? "top-rated" : "property"
      } search with params:`,
      params
    );

    // Schedule fetch after a small delay to ensure all UI is ready
    // Use a shorter delay for top-rated queries
    const delay = isTopRated ? 300 : 500;

    const timer = setTimeout(() => {
      fetchProperties().then(() => {
        hasFetchedRef.current = true;

        // Cache the results if we have a stable key
        if (stableKey && properties.length > 0) {
          propertyCache[stableKey] = [...properties];
          console.log(
            `Cached ${properties.length} properties for key: ${stableKey}`
          );
        }
      });
    }, delay);

    return () => {
      clearTimeout(timer);
    };
    // Use a stable version of the dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only key parameters trigger a refetch
    params.sort?.field,
    params.sort?.order,
    params.location,
    params.city,
    params.country,
    params.propertyType,
    stableKey, // Include stableKey to ensure we fetch once per key
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      hasFetchedRef.current = false;
    };
  }, []);

  return { properties, loading, error, fetchProperties };
}
