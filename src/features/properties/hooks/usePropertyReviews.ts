import { useQuery } from "@tanstack/react-query";
import { review } from "@core/api/services";

/**
 * Hook for fetching property reviews
 */
export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: () => review.getPropertyReviews(propertyId),
    enabled: !!propertyId,
  });
};

/**
 * Hook for calculating review statistics
 */
export const useReviewStats = (reviews: any[] | undefined) => {
  const calculateAverageRating = () => {
    if (!reviews?.length) return 0;

    const criteria = [
      "cleanliness",
      "accuracy",
      "communication",
      "location",
      "value",
    ] as const;
    let totalSum = 0;
    let totalCount = 0;

    reviews.forEach((review) => {
      criteria.forEach((criterion) => {
        if (review[criterion] && typeof review[criterion] === "number") {
          totalSum += review[criterion] as number;
          totalCount++;
        }
      });
    });

    return totalCount > 0 ? totalSum / totalCount : 0;
  };

  const calculateCategoryAverages = () => {
    if (!reviews?.length) return {};

    const criteria = [
      "cleanliness",
      "accuracy",
      "communication",
      "location",
      "value",
    ] as const;
    const averages: Record<string, number> = {};

    criteria.forEach((criterion) => {
      let sum = 0;
      let count = 0;

      reviews.forEach((review) => {
        if (review[criterion] && typeof review[criterion] === "number") {
          sum += review[criterion] as number;
          count++;
        }
      });

      averages[criterion] = count > 0 ? sum / count : 0;
    });

    return averages;
  };

  const averageRating = calculateAverageRating();
  const categoryAverages = calculateCategoryAverages();

  return {
    averageRating,
    categoryAverages,
    totalReviews: reviews?.length || 0,
  };
};
