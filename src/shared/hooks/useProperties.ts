/**
 * Custom hooks to fetch and filter properties based on search criteria
 * Handles fetching data from the API, loading states, and error handling
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PropertyType } from "../types/property";
import {
  fetchFeaturedProperties as fetchFeaturedPropertiesApi,
  searchProperties as searchPropertiesApi,
} from "@shared/services/propertyService";

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
    title: apiProperty.title || apiProperty.name || "Untitled Property",
    name: apiProperty.name || apiProperty.title || "Untitled Property", // Use 'name' consistently with the new type
    type: apiProperty.type || "apartment",
    propertyType: apiProperty.propertyType || "entire_place",
    description: apiProperty.description || "",
    status: apiProperty.status || "active",
    images: apiProperty.photos || apiProperty.images || [], // Check both photos and images arrays
    price:
      typeof (apiProperty.price || price) === "object"
        ? apiProperty.price || price
        : {
            amount: apiProperty.price || price || 0,
            currency: apiProperty.currency || "USD",
            period: "night",
          },
    currency: apiProperty.currency || "USD", // Use provided currency or default
    address: apiProperty.address || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    coordinates:
      apiProperty.coordinates ||
      (apiProperty.location?.coordinates
        ? {
            latitude: apiProperty.location.coordinates[1], // GeoJSON uses [longitude, latitude]
            longitude: apiProperty.location.coordinates[0],
          }
        : { latitude: 0, longitude: 0 }),
    rating: rating,
    reviewCount: apiProperty.reviews?.length || 0,
    isActive: apiProperty.isActive ?? true,
    isFeatured: apiProperty.isFeatured || false,
    isSuperHost: apiProperty.isSuperHost || false, // Use provided value if available
    isWishlisted: apiProperty.isWishlisted || false, // Use provided value if available
    amenities: apiProperty.commonAmenities || apiProperty.amenities || [],
    bedrooms: apiProperty.units?.[0]?.bedrooms || 1,
    beds: apiProperty.units?.[0]?.beds || 1,
    bathrooms: apiProperty.units?.[0]?.bathrooms || 1,
    maxGuests: apiProperty.maxGuests || apiProperty.units?.[0]?.maxGuests || 2,
    host: apiProperty.hostId || apiProperty.host || "",
    hostId: apiProperty.hostId || apiProperty.host || "",
    hostName: "", // Not provided in API response
    hostImage: "", // Not provided in API response
    createdAt: apiProperty.createdAt || new Date().toISOString(),
    updatedAt: apiProperty.updatedAt || new Date().toISOString(),
  };
};

// Define search parameters interface
export interface SearchParams {
  location?: string;
  city?: string;
  state?: string;
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

/**
 * Hook for getting featured properties
 * Used on the home page to display featured listings
 */
export function useFeaturedProperties(): PropertiesHookReturn {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const isMountedRef = useRef(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch featured properties from API
      const apiProperties = await fetchFeaturedPropertiesApi();

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
    } catch (err) {
      console.error("Error fetching featured properties:", err);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, fetchProperties };
}

/**
 * Hook for searching properties based on criteria
 * Used on the search results page
 */
export function useProperties(params: SearchParams = {}): PropertiesHookReturn {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add these to track request frequency
  const requestCountRef = useRef(0);
  const lastRequestTimeRef = useRef(Date.now());
  const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
  const isMountedRef = useRef(false);

  // Create a memoized search query object
  const searchQuery = useMemo(() => {
    const query: Record<string, any> = {}; // Enhanced location handling
    if (params.location && params.location.trim() !== "") {
      // Use location as a keyword for comprehensive searching
      query.keyword = params.location;

      // Don't set separate city/country when we have a full location string
      // This prevents conflicts between keyword search and field-specific search
    }

    // Add explicit city/country/state only if no location keyword is provided
    // This supports advanced search with separate fields
    if (!query.keyword) {
      if (params.city) query.city = params.city;
      if (params.country) query.country = params.country;
      if (params.state) query.state = params.state;
    }

    // Removed coordinate-based search to avoid geospatial query issues
    // Only use text-based location matching

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
  ]);

  // Function to fetch properties based on search params
  const fetchProperties = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching properties with params:", searchQuery);

      // Special logging for top-rated searches
      if (params.sort?.field === "rating" && params.sort?.order === "desc") {
        console.log(
          "🔍 TOP RATED SEARCH - Query being sent:",
          JSON.stringify(searchQuery, null, 2)
        );
      } // Always use normal search endpoint (removed nearby search logic)
      console.log("Final search query:", JSON.stringify(searchQuery, null, 2));
      const properties = await searchPropertiesApi(searchQuery);

      console.log(`Found ${properties.length} matching properties`);
      if (properties.length > 0) {
        console.log("First property data example:", properties[0]._id);
      }

      setProperties(properties.map(transformPropertyData));

      setError(null);
    } catch (err) {
      console.error("Error searching properties:", err);
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
    } finally {
      setLoading(false);
    }
  }, [searchQuery, params.sort?.field, params.sort?.order]);

  // Fetch properties on mount only, not when fetchProperties reference changes
  useEffect(() => {
    // Only fetch on initial mount (to prevent infinite loops)
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      // Add some logging to debug search params
      console.log("Initial search params:", params);

      // Schedule fetch after a small delay to ensure all UI is ready
      const timer = setTimeout(() => {
        fetchProperties();
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run once on mount

  return { properties, loading, error, fetchProperties };
}
