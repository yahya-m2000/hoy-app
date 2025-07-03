/**
 * ReviewsList Component
 * Displays a list of property reviews
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Modal, Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useTheme } from "@core/hooks/useTheme";
import { ReviewService } from "@core/api/services";
import { fontSize, spacing, radius } from "@core/design";
import type { Review, ReviewStats } from "@core/types";

interface ReviewsListProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  visible,
  onClose,
  propertyId,
  propertyName,
}) => {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading reviews for property:", propertyId);
      const [reviewsData, statsData] = await Promise.all([
        ReviewService.getPropertyReviews(propertyId),
        ReviewService.getPropertyReviewStats(propertyId),
      ]);

      console.log("Reviews loaded:", reviewsData?.length || 0);
      console.log("Stats loaded:", statsData);

      setReviews(reviewsData || []);
      setStats(statsData || null);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setError("Failed to load reviews");
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (visible && propertyId) {
      loadReviews();
    }
  }, [visible, propertyId, loadReviews]);
  const renderStars = (rating: number, size: number = 14) => {
    const safeRating = rating || 0;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= safeRating ? "star" : "star-outline"}
            size={size}
            color={star <= safeRating ? "#FF385C" : theme.text.tertiary}
          />
        ))}
      </View>
    );
  };
  const renderCriteriaRatings = (review: Review) => {
    const criteria = [
      { key: "cleanliness", label: "Cleanliness", value: review.cleanliness },
      {
        key: "communication",
        label: "Communication",
        value: review.communication,
      },
      { key: "checkIn", label: "Check-in", value: review.checkIn },
      { key: "accuracy", label: "Accuracy", value: review.accuracy },
      { key: "location", label: "Location", value: review.location },
      { key: "value", label: "Value", value: review.value },
    ].filter(
      (criterion) => criterion.value !== undefined && criterion.value !== null
    );

    // Don't render if no criteria available
    if (criteria.length === 0) {
      return null;
    }

    return (
      <View style={styles.criteriaContainer}>
        {criteria.map((criterion) => (
          <View key={criterion.key} style={styles.criteriaRow}>
            <Text
              style={[styles.criteriaLabel, { color: theme.text.secondary }]}
            >
              {criterion.label}
            </Text>
            {renderStars(criterion.value, 12)}
            <Text
              style={[styles.criteriaValue, { color: theme.text.secondary }]}
            >
              {criterion.value?.toFixed(1) || "0.0"}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewItem, { borderBottomColor: theme.border }]}>
      {/* Review Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthor}>
          <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
            <Text style={[styles.avatarText, { color: theme.text.primary }]}>
              {item.author.firstName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: theme.text.primary }]}>
              {item.author.firstName} {item.author.lastName}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.text.secondary }]}>
              {format(new Date(item.createdAt), "MMMM yyyy")}
            </Text>
          </View>
        </View>
        <View style={styles.overallRating}>
          {renderStars(item.overallRating, 16)}
        </View>
      </View>

      {/* Review Content */}
      <Text style={[styles.reviewContent, { color: theme.text.primary }]}>
        {item.content}
      </Text>

      {/* Criteria Ratings */}
      {renderCriteriaRatings(item)}

      {/* Host Response */}
      {item.response && (
        <View style={[styles.hostResponse, { backgroundColor: theme.surface }]}>
          <Text
            style={[styles.hostResponseLabel, { color: theme.text.secondary }]}
          >
            Response from host:
          </Text>
          <Text
            style={[styles.hostResponseContent, { color: theme.text.primary }]}
          >
            {item.response.content}
          </Text>
          <Text
            style={[styles.hostResponseDate, { color: theme.text.secondary }]}
          >
            {format(new Date(item.response.date), "MMMM yyyy")}
          </Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Reviews for {propertyName}
      </Text>
      {stats &&
        stats.averageRating !== undefined &&
        stats.averageRating !== null && (
          <View style={styles.statsContainer}>
            <View style={styles.overallStats}>
              {renderStars(stats.averageRating, 20)}
              <Text
                style={[styles.averageRating, { color: theme.text.primary }]}
              >
                {stats.averageRating.toFixed(1)} ({stats.count || 0} reviews)
              </Text>
            </View>
          </View>
        )}
    </View>
  );
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Reviews"
      enableAutoScroll={false}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
              Loading reviews...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  listContainer: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  overallStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  averageRating: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewItem: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  reviewDate: {
    fontSize: fontSize.sm,
  },
  overallRating: {
    alignItems: "flex-end",
  },
  reviewContent: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.4,
    marginBottom: spacing.md,
  },
  criteriaContainer: {
    marginTop: spacing.md,
  },
  criteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  criteriaLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  criteriaValue: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    width: 30,
    textAlign: "right",
  },
  hostResponse: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  hostResponseLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  hostResponseContent: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.xs,
  },
  hostResponseDate: {
    fontSize: fontSize.xs,
  },
});

export { ReviewsList };
