import { useQuery } from "@tanstack/react-query";
import { host } from "@core/api/services";

export interface PropertyReview {
  _id: string;
  guest: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  property: {
    title: string;
    location: any;
    images: string[];
  };
  overallRating: number;
  ratings: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
  comment: string;
  createdAt: string;
}

export interface PropertyInsights {
  _id: string;
  title: string;
  location: any;
  images: string[];
  averageRating: number;
  totalReviews: number;
  categoryAverages: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
  recentReviews: PropertyReview[];
}

export interface HostInsightsData {
  hostId: string;
  averageRating: number;
  totalReviews: number;
  properties: PropertyInsights[];
}

/**
 * Hook to get comprehensive host insights including reviews, ratings, and analytics
 * This hook fetches all data needed for the host insights dashboard
 */
export const useHostInsights = (hostId?: string) => {
  return useQuery<HostInsightsData, Error>({
    queryKey: ["hostInsights", hostId],
    queryFn: async () => {
      console.log(
        "🔍 [useHostInsights] Fetching comprehensive host insights for hostId:",
        hostId
      );

      try {
        const response = await host.HostDashboardService.getInsights("all");
        console.log("📋 [useHostInsights] Raw API response:", response);

        // If the API returns null (e.g. 404 or not implemented yet), fall back to sensible defaults to
        // avoid runtime crashes in the UI. This keeps the hook stable even when the backend feature
        // is missing.
        if (!response) {
          console.warn(
            "⚠️  [useHostInsights] No insights data returned by API, using fallback defaults."
          );
          return {
            hostId: hostId || "current",
            averageRating: 0,
            totalReviews: 0,
            properties: [],
          } as HostInsightsData;
        }

        // Type-cast the response now that it is guaranteed not to be null
        const typedResponse = response as HostInsightsData;

        // Defensive programming: ensure required fields exist, otherwise replace with defaults
        const safeResponse: HostInsightsData = {
          hostId: typedResponse.hostId ?? hostId ?? "current",
          averageRating: typedResponse.averageRating ?? 0,
          totalReviews: typedResponse.totalReviews ?? 0,
          properties: typedResponse.properties ?? [],
        };

        // Log key metrics for debugging
        console.log("📊 [useHostInsights] Host average rating:", safeResponse.averageRating);
        console.log("📝 [useHostInsights] Total reviews:", safeResponse.totalReviews);
        console.log("🏠 [useHostInsights] Number of properties:", safeResponse.properties.length);

        if (safeResponse.properties.length > 0) {
          console.log("🏠 [useHostInsights] Property list for navigation:");
          safeResponse.properties.forEach((property: PropertyInsights, index: number) => {
            console.log(
              `  ${index + 1}. ${property.title} (ID: ${property._id}) - Rating: ${property.averageRating}`
            );
          });
        }

        return safeResponse;
      } catch (error: any) {
        console.error(
          "❌ [useHostInsights] Error fetching host insights:",
          error
        );
        
        // Handle 403 errors gracefully - user doesn't have host permissions yet
        if (error?.response?.status === 403) {
          console.log("🔐 [useHostInsights] User doesn't have host permissions yet - returning fallback data");
          return {
            hostId: hostId || "current",
            averageRating: 0,
            totalReviews: 0,
            properties: [],
          } as HostInsightsData;
        }
        
        // Return fallback data instead of propagating the error so that the UI can remain functional
        return {
          hostId: hostId || "current",
          averageRating: 0,
          totalReviews: 0,
          properties: [],
        } as HostInsightsData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (user needs to complete setup)
      if (error?.response?.status === 403) {
        return false;
      }
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
};

/**
 * Hook to get insights for the current authenticated host
 * This is a convenience hook that automatically fetches insights for the logged-in host
 */
export const useCurrentHostInsights = () => {
  console.log(
    "🔐 [useCurrentHostInsights] Fetching insights for current authenticated host"
  );
  return useHostInsights(); // No hostId means current user
};
