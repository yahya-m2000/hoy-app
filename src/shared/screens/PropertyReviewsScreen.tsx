/**
 * Property Reviews Screen (Shared Component)
 * Shows all reviews for a specific property with minimal Amazon-style design
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context
import { useTheme } from "@shared/hooks/useTheme";

// Components
import { Icon } from "@shared/components/base";

// Constants
import { fontSize, fontWeight, spacing } from "@shared/constants";

// Services
import { ReviewService } from "@shared/services/api/review";

// Hooks
import { useQuery } from "@tanstack/react-query";

interface PropertyReviewsScreenProps {
  propertyId: string;
}

export function PropertyReviewsScreen({
  propertyId,
}: PropertyReviewsScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  // Calculate average for each category
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

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={
              star <= rating ? theme.colors.primary : theme.colors.gray[400]
            }
          />
        ))}
      </View>
    );
  };
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={theme.colors.gray[400]} />
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>
            {error?.message || "Unable to load reviews"}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}
      >
        {/* Reviews Summary */}
        {reviews && reviews.length > 0 && (
          <View
            style={[
              styles.summaryContainer,
              { borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.ratingRow}>
              <Text
                style={[styles.averageRating, { color: theme.text.primary }]}
              >
                {averageRating.toFixed(1)}
              </Text>
              {renderStars(averageRating, 20)}
              <Text
                style={[styles.reviewCount, { color: theme.text.secondary }]}
              >
                ({reviews.length})
              </Text>
            </View>

            {/* Category Ratings */}
            <View style={styles.categoryRatings}>
              {Object.entries(categoryAverages).map(([category, rating]) => (
                <View key={category} style={styles.categoryRow}>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <View style={styles.categoryRating}>
                    <Text
                      style={[
                        styles.categoryScore,
                        { color: theme.text.primary },
                      ]}
                    >
                      {rating.toFixed(1)}
                    </Text>
                    {renderStars(rating, 14)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View
                key={review._id || index}
                style={[styles.reviewCard, { borderBottomColor: theme.border }]}
              >
                {/* User Info and Rating */}
                <View style={styles.reviewHeader}>
                  <View style={styles.userInfo}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {(review.author?.firstName?.[0] || "A").toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[styles.userName, { color: theme.text.primary }]}
                      >
                        {review.author?.firstName && review.author?.lastName
                          ? `${review.author.firstName} ${review.author.lastName}`
                          : "Anonymous"}
                      </Text>
                      <Text
                        style={[
                          styles.reviewDate,
                          { color: theme.text.secondary },
                        ]}
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {renderStars(averageRating)}
                </View>

                {/* Review Comment */}
                {review.content && (
                  <Text style={[styles.comment, { color: theme.text.primary }]}>
                    {review.content}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon
                name="star-outline"
                size={48}
                color={theme.colors.gray[400]}
              />
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                No Reviews Yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                This property doesn&apos;t have any reviews yet.
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  averageRating: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewCount: {
    fontSize: fontSize.md,
  },
  categoryRatings: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  categoryRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  categoryScore: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    minWidth: 24,
    textAlign: "right",
  },
  reviewsContainer: {
    paddingHorizontal: spacing.lg,
  },
  reviewCard: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: fontSize.sm,
  },
  comment: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
});
