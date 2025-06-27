/**
 * Custom hook for fetching property reviews and calculating statistics
 * Provides reusable review data across components
 */

import { useQuery } from "@tanstack/react-query";
import { ReviewService } from "@shared/services/api/review";
import type { Review } from "@shared/types/review";

export interface PropertyReviewStats {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  isLoading: boolean;
  error: any;
  // Individual rating averages
  cleanlinessAverage: number;
  accuracyAverage: number;
  communicationAverage: number;
  locationAverage: number;
  valueAverage: number;
  checkInAverage: number;
}

export const usePropertyReviews = (propertyId: string): PropertyReviewStats => {
  // Fetch property reviews
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: () => ReviewService.getPropertyReviews(propertyId),
    enabled: !!propertyId,
  });

  // Calculate average ratings
  const calculateAverage = (field: keyof Review) => {
    if (!reviews?.length) return 0;
    const validReviews = reviews.filter((review) => {
      const value = review[field];
      return typeof value === "number" && value > 0;
    });
    if (!validReviews.length) return 0;
    return (
      validReviews.reduce((sum, review) => sum + (review[field] as number), 0) /
      validReviews.length
    );
  };

  const averageRating = calculateAverage("overallRating");
  const reviewCount = reviews?.length || 0;

  return {
    reviews: reviews || [],
    averageRating,
    reviewCount,
    isLoading,
    error,
    // Individual rating averages
    cleanlinessAverage: calculateAverage("cleanliness"),
    accuracyAverage: calculateAverage("accuracy"),
    communicationAverage: calculateAverage("communication"),
    locationAverage: calculateAverage("location"),
    valueAverage: calculateAverage("value"),
    checkInAverage: calculateAverage("checkIn"),
  };
};
