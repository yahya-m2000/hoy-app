import { PROPERTY_ENDPOINTS } from "@common/constants/apiEndpoints";
import api from "@common/services/api";
import { PropertyType } from "@common/types/property";
import { isNetworkError, logErrorWithContext } from "@common/utils/error";
import { addToRetryQueue } from "@common/utils/network";

export interface PropertyFilters {
  [key: string]: any;
}

export const fetchProperties = async (
  params?: PropertyFilters
): Promise<PropertyType[]> => {
  try {
    const response = await api.get<{ data: PropertyType[] }>("/properties", {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    logErrorWithContext("fetchProperties", error);

    // Add to retry queue if it's a network error
    if (isNetworkError(error)) {
      addToRetryQueue(() => fetchProperties(params));
    }

    return []; // Return empty array to prevent app crashes
  }
};

export const fetchFeaturedProperties = async (): Promise<PropertyType[]> => {
  try {
    // Static API request rate limiting
    const now = Date.now();
    const lastRequestTime = (global as any)._lastFeaturedRequestTime || 0;
    const minInterval = 5000; // 5 seconds minimum between requests

    if (now - lastRequestTime < minInterval) {
      console.log("Rate limiting featured properties API calls");
      // Return cached results or empty array
      return (global as any)._cachedFeaturedProperties || [];
    }

    // Update last request time
    (global as any)._lastFeaturedRequestTime = now;

    const response = await api.get<{ data: PropertyType[] }>(
      PROPERTY_ENDPOINTS.FEATURED
    );
    console.log("Featured properties API response status:", response.status);

    if (!response.data || !response.data.data) {
      console.error(
        "Invalid featured properties response structure:",
        response.data
      );
      return [];
    }

    // Cache the results
    (global as any)._cachedFeaturedProperties = response.data.data;

    return response.data.data;
  } catch (error: any) {
    logErrorWithContext("fetchFeaturedProperties", error);

    // Handle rate limiting specifically
    if (error.response && error.response.status === 429) {
      console.log("Rate limit exceeded for featured properties API");
      // Set a longer cooldown period after hitting rate limit
      (global as any)._lastFeaturedRequestTime = Date.now() + 30000; // 30 second cooldown
      return (global as any)._cachedFeaturedProperties || []; // Return cached or empty
    }

    if (error.response) {
      console.error(
        `API error (${error.response.status}):`,
        error.response.data
      );
    } else if (error.request) {
      console.error("Network error - no response received:", error.message);
    }

    // Add to retry queue if it's a network error
    if (isNetworkError(error)) {
      addToRetryQueue(() => fetchFeaturedProperties());
    }

    // Return cached data if available, otherwise empty array
    return (global as any)._cachedFeaturedProperties || [];
  }
};

export const searchProperties = async (
  query: PropertyFilters
): Promise<PropertyType[]> => {
  try {
    // Create a clean query object with only valid parameters
    const validParams: Record<string, any> = {};

    // Handle empty query parameters - add more comprehensive parameter checking
    if (!query || Object.keys(query).length === 0) {
      console.log("Empty search query provided");
      return [];
    } // Set a timestamp to track this specific API call for debugging
    const apiCallId = Date.now().toString().slice(-4);

    // Clean up the query parameters (sanitize input)
    if (query.keyword) validParams.keyword = query.keyword;
    if (query.location) {
      // Location can contain both city and country in one string
      const locationParts = query.location
        .split(",")
        .map((part: string) => part.trim());
      if (locationParts.length > 1) {
        validParams.city = locationParts[0];
        validParams.country = locationParts[locationParts.length - 1];
      } else {
        // If only one part, use it as both city and keyword for better results
        validParams.city = query.location;
        validParams.keyword = validParams.keyword || query.location;
      }
    } // Handle coordinate-based search - DISABLED to avoid geospatial query issues
    // Only use location text-based matching now
    /*
    if (query.latitude !== undefined && query.longitude !== undefined) {
      // Use the coordinate validation utility
      const validCoords = formatCoordinateParams(
        query.latitude,
        query.longitude,
        query.radius
      );
      if (validCoords) {
        // Use the validated and formatted coordinates
        // Always use lat/lng format for consistency with backend
        validParams.lat = validCoords.latitude;
        validParams.lng = validCoords.longitude;
        validParams.radius = validCoords.radius;

        console.log(
          `Using coordinate-based search: ${validParams.lat}, ${validParams.lng}, radius: ${validParams.radius}km`
        );
      } else {
        console.error("Invalid coordinate values provided:", {
          latitude: query.latitude,
          longitude: query.longitude,
          radius: query.radius,
        });
        // Return empty results for invalid coordinates
        return [];
      }
    }
    */ // Separate handling for city, state, and country if provided directly
    if (query.country) validParams.country = query.country;
    if (query.city) validParams.city = query.city;
    if (query.state) validParams.state = query.state;

    // Handle numeric parameters with proper conversion
    if (query.guests && !isNaN(Number(query.guests))) {
      validParams.guests = Number(query.guests);
    }
    if (query.startDate) validParams.startDate = query.startDate;
    if (query.endDate) validParams.endDate = query.endDate;
    if (query.minPrice) validParams.minPrice = Number(query.minPrice);
    if (query.maxPrice) validParams.maxPrice = Number(query.maxPrice);
    if (query.type) validParams.propertyType = query.type; // Fix field name to match API
    if (query.amenities) validParams.amenities = query.amenities;
    if (query.sort) validParams.sort = query.sort;
    if (query.page) validParams.page = Number(query.page);
    if (query.limit) validParams.limit = Number(query.limit);
    if (query.rooms) validParams.rooms = Number(query.rooms); // Check for cached results
    const cacheKey = JSON.stringify(validParams);
    const cachedResults = (global as any)._propertySearchCache?.[cacheKey];
    const cacheExpiry =
      (global as any)._propertySearchCacheExpiry?.[cacheKey] || 0;

    if (cachedResults && Date.now() < cacheExpiry) {
      if (__DEV__ && Math.random() < 0.1) {
        console.log(`[${apiCallId}] Using cached search results`);
      }
      return cachedResults;
    } // Static API request rate limiting
    const now = Date.now();
    const lastRequestTime = (global as any)._lastPropertySearchRequestTime || 0;
    const minInterval = 10000; // 10 seconds minimum between identical requests (increased from 5s)

    // Get the global rate limiting counter to track overall API request frequency
    const rateLimitCounter = (global as any)._propertySearchRateCounter || {
      count: 0,
      resetTime: now + 60000, // 1 minute window
    };

    // Reset counter if window has expired
    if (now > rateLimitCounter.resetTime) {
      rateLimitCounter.count = 0;
      rateLimitCounter.resetTime = now + 60000;
    }

    // Check if we've hit the rate limit for this window (max 10 requests per minute)
    const isRateLimited = rateLimitCounter.count >= 10;

    // Check if there's a pending request that hasn't completed
    const isPendingRequest = (global as any)._pendingSearchRequest === cacheKey;
    if (
      (now - lastRequestTime < minInterval &&
        (global as any)._lastPropertySearchParams === cacheKey) ||
      isPendingRequest ||
      isRateLimited
    ) {
      // Only log in DEV mode and only sometimes
      if (__DEV__ && Math.random() < 0.1) {
        const reason = isRateLimited
          ? "global rate limit exceeded"
          : isPendingRequest
          ? "identical request in progress"
          : "too soon after last request";
        console.log(`Search request throttled (${reason})`);
      }
      // Return cached results if available, otherwise empty array
      return cachedResults || [];
    }

    // Update rate limiting counter
    rateLimitCounter.count += 1;
    (global as any)._propertySearchRateCounter = rateLimitCounter;

    // Mark this request as pending
    (global as any)._pendingSearchRequest = cacheKey; // Update last request time and params
    (global as any)._lastPropertySearchRequestTime = now;
    (global as any)._lastPropertySearchParams = cacheKey; // Fix known problematic parameters
    if (validParams.sort && typeof validParams.sort === "string") {
      // Ensure we're using the correct format for the v1 API
      if (validParams.sort.includes("_")) {
        // Convert old format to new format
        validParams.sort = validParams.sort.replace("_", ":");
        if (__DEV__ && Math.random() < 0.2) {
          console.log(
            `Converted sort parameter to API v1 format: ${validParams.sort}`
          );
        }
      }
    } // Log the request for debugging only in DEV mode
    if (__DEV__ && Math.random() < 0.1) {
      // Only log 10% of requests to reduce spam
      console.log("API request: /properties/search");
    }

    try {
      // Make API call with correct endpoint
      const response = await api.get<{ data: PropertyType[] }>(
        PROPERTY_ENDPOINTS.SEARCH,
        { params: validParams }
      ); // Log response status and data
      if (__DEV__ && Math.random() < 0.1) {
        console.log(`[${apiCallId}] API response status: ${response.status}`);
      }

      // Cache the results
      (global as any)._propertySearchCache = {
        ...(global as any)._propertySearchCache,
        [cacheKey]: response.data.data,
      };

      // Set cache to expire after 5 minutes
      (global as any)._propertySearchCacheExpiry = {
        ...(global as any)._propertySearchCacheExpiry,
        [cacheKey]: Date.now() + 5 * 60 * 1000,
      };

      // Clear the pending request flag
      (global as any)._pendingSearchRequest = null;

      // Log only in DEV mode and only sometimes
      if (__DEV__ && Math.random() < 0.1) {
        console.log(
          `[${apiCallId}] API returned ${response.data.data.length} properties`
        );
      }

      return response.data.data;
    } catch (error: any) {
      // Clear the pending request flag
      (global as any)._pendingSearchRequest = null; // Check for rate limiting errors (429)
      if (error.response && error.response.status === 429) {
        if (__DEV__) {
          console.log("Rate limit exceeded for property search API");
        }

        // Implement exponential backoff strategy
        const currentBackoff = (global as any)._propertySearchBackoff || 5000;
        const newBackoff = Math.min(currentBackoff * 2, 60000); // Max 1 minute

        // Set a longer cooldown period after hitting rate limit
        (global as any)._lastPropertySearchRequestTime =
          Date.now() + currentBackoff;
        (global as any)._propertySearchBackoff = newBackoff;

        // Log the backoff information
        console.log(
          `API rate limited. Backing off for ${
            currentBackoff / 1000
          } seconds before next request`
        );

        // Return cached results if available, otherwise empty array
        return cachedResults || [];
      } else {
        // Reset backoff if this wasn't a rate limit error
        (global as any)._propertySearchBackoff = 5000;
      } // Check for bad request errors (400) - might be an issue with the request parameters
      if (error.response && error.response.status === 400) {
        if (__DEV__) {
          console.error(
            "Bad request error (400) - check API parameters:",
            validParams
          );

          // Log more details about the validation error if available
          if (error.response.data) {
            console.error("Validation error details:", error.response.data);
          }
        }
        // Prevent repeated bad requests with the same parameters
        (global as any)._lastPropertySearchRequestTime = Date.now() + 10000; // 10 seconds cooldown
        return cachedResults || [];
      } // Log error only in DEV mode
      if (__DEV__) {
        console.error(
          `API error (${error.response?.status || "unknown"})`,
          error.response?.data || error.message || "Unknown error"
        );

        // Additional debug information for 404 errors (route not found)
        if (error.response?.status === 404) {
          console.error(
            "Route not found error. Check if the endpoint path is correct.",
            "Full URL was:",
            error.config?.url,
            "Make sure not to add /api/v1 prefix as it's already in the baseURL.",
            "Query params:",
            validParams
          );
        }
      }

      // Add to retry queue if it's a network error and not a 404
      if (isNetworkError(error) && error.response?.status !== 404) {
        addToRetryQueue(() => searchProperties(query));
      }

      // Return empty array to prevent app crashes
      return cachedResults || [];
    }
  } catch (error) {
    // Clear the pending request flag
    (global as any)._pendingSearchRequest = null;

    // Log error only in DEV mode
    if (__DEV__) {
      console.error(
        "Property search error:",
        typeof error === "object"
          ? (error as any)?.message || "Unknown error"
          : String(error)
      );
    }
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const fetchNearbyProperties = async (coords: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<PropertyType[]> => {
  try {
    const response = await api.get<{ data: PropertyType[] }>(
      "/properties/nearby",
      { params: coords }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching nearby properties:", error);
    if (error.response) {
      console.error(
        `API error (${error.response.status}):`,
        error.response.data
      );
    } else if (error.request) {
      console.error("Network error - no response received:", error.message);
    }
    return []; // Return empty array to prevent app crashes
  }
};

export const fetchPropertyById = async (id: string): Promise<PropertyType> => {
  try {
    const response = await api.get<{ data: PropertyType }>(`/properties/${id}`);
    return response.data.data;
  } catch (error: any) {
    logErrorWithContext(`fetchPropertyById(${id})`, error);

    // Add to retry queue if it's a network error
    if (isNetworkError(error)) {
      addToRetryQueue(() => fetchPropertyById(id));
    }

    throw error; // Rethrow as we can't return a default property
  }
};

export const fetchPropertyCalendar = (id: string) =>
  api
    .get<{ data: any }>(`/properties/${id}/calendar`)
    .then((res) => res.data.data);

/**
 * Get available dates for a property
 * @param propertyId Property ID to check
 * @param period Number of days to check starting from today
 * @returns Array of available date ranges
 */
export const getAvailableDates = async (
  propertyId: string,
  period: number = 90
) => {
  try {
    const response = await api.get<{ data: any }>(
      `/properties/${propertyId}/available-dates`,
      {
        params: { period },
      }
    );
    return response.data.data.availableDates || [];
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return [];
  }
};

/**
 * Find optimal stay periods for a property
 * @param propertyId Property ID to check
 * @returns Object with suggested stay dates
 */
export const getOptimalStayPeriods = async (propertyId: string) => {
  try {
    const response = await api.get<{ data: any }>(
      `/properties/${propertyId}/optimal-stays`
    );
    return (
      response.data.data || {
        weekend: null,
        weeklong: null,
        nextAvailable: null,
      }
    );
  } catch (error) {
    console.error("Error fetching optimal stay periods:", error);
    return {
      weekend: null,
      weeklong: null,
      nextAvailable: null,
    };
  }
};

export const fetchPropertyUnits = (id: string) =>
  api
    .get<{ data: any[] }>(`/properties/${id}/units`)
    .then((res) => res.data.data);

export const fetchUnitById = (propertyId: string, unitId: string) =>
  api
    .get<{ data: any }>(`/properties/${propertyId}/units/${unitId}`)
    .then((res) => res.data.data);

export const fetchPropertyReviews = (id: string) =>
  api
    .get<{ data: any[] }>(`/properties/${id}/reviews`)
    .then((res) => res.data.data);
export function getPropertyHostInfo(property: PropertyType) {
  return {
    hostId: property.hostId || "",
    hostName: property.hostName || "",
    hostImage: property.hostImage || "",
  };
}

/**
 * Fetch detailed host information for a property
 */
export const fetchPropertyHostInfo = async (propertyId: string) => {
  try {
    const response = await api.get<{ data: any }>(
      `/properties/${propertyId}/host`
    );
    return response.data.data;
  } catch (error: any) {
    logErrorWithContext("fetchPropertyHostInfo", error);

    // Return default host info if fetch fails
    return {
      hostId: "",
      hostName: "",
      hostImage: "",
      phone: "",
      email: "",
      hostType: "individual",
      isSuperHost: false,
      responseRate: "New Host",
      responseTime: "New Host",
    };
  }
};

/**
 * Fetch public host profile information
 */
export const fetchPublicHostProfile = async (hostId: string) => {
  try {
    const response = await api.get<{ data: any }>(
      `/properties/host/${hostId}/profile`
    );
    return response.data.data;
  } catch (error: any) {
    logErrorWithContext("fetchPublicHostProfile", error);

    // Return default host profile if fetch fails
    return {
      hostId,
      hostName: "",
      hostImage: "",
      phone: "",
      email: "",
      hostType: "individual",
      isSuperHost: false,
      totalProperties: 0,
      totalReviews: 0,
      avgRating: 0,
      responseRate: "New Host",
      responseTime: "New Host",
      joinedDate: new Date(),
      isVerified: false,
    };
  }
};
