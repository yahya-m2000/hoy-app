import { useQuery } from "@tanstack/react-query";
import { getHostReviewsAndRatings } from "@shared/services/hostService";

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
        const response = await getHostReviewsAndRatings(hostId);
        console.log("📋 [useHostInsights] Raw API response:", response);

        // Type the response properly
        const typedResponse = response as HostInsightsData;

        // Log specific data points for debugging
        console.log(
          "📊 [useHostInsights] Host average rating:",
          typedResponse.averageRating
        );
        console.log(
          "📝 [useHostInsights] Total reviews:",
          typedResponse.totalReviews
        );
        console.log(
          "🏠 [useHostInsights] Number of properties:",
          typedResponse.properties?.length || 0
        );

        if (typedResponse.properties && typedResponse.properties.length > 0) {
          console.log("🏠 [useHostInsights] Property list for navigation:");
          typedResponse.properties.forEach(
            (property: PropertyInsights, index: number) => {
              console.log(
                `  ${index + 1}. ${property.title} (ID: ${
                  property._id
                }) - Rating: ${property.averageRating}`
              );
            }
          );
        }

        return typedResponse;
      } catch (error) {
        console.error(
          "❌ [useHostInsights] Error fetching host insights:",
          error
        );
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
