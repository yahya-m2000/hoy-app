import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { Icon } from "@shared/components/base";

// Constants
import { spacing, radius } from "@shared/constants";

interface RatingsReviewsSectionProps {
  propertyId: string;
  averageRating: number;
  reviewCount: number;
  onShowReviews: () => void;
}

const RatingsReviewsSection: React.FC<RatingsReviewsSectionProps> = ({
  propertyId,
  averageRating,
  reviewCount,
  onShowReviews,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use the rating and reviewCount passed as props instead of fetching reviews
  const safeReviewCount =
    typeof reviewCount === "number" && !isNaN(reviewCount) ? reviewCount : 0;
  const safeRating =
    typeof averageRating === "number" && !isNaN(averageRating)
      ? averageRating
      : 0; // Simple translation without problematic pluralization
  const getReviewCountText = () => {
    try {
      // Use simple conditional keys to avoid i18next pluralization issues
      const key =
        safeReviewCount === 1
          ? "property.singleReview"
          : "property.multipleReviews";
      const result = t(key, { count: safeReviewCount });

      // If translation succeeds, return it
      if (result && result !== key) {
        return result;
      }

      // Fallback to English
      return `${safeReviewCount} ${
        safeReviewCount === 1 ? "Review" : "Reviews"
      }`;
    } catch (error) {
      console.warn("Translation error for review count:", error);
      // Fallback to English
      return `${safeReviewCount} ${
        safeReviewCount === 1 ? "Review" : "Reviews"
      }`;
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onShowReviews}>
      <View style={styles.leftSection}>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={18} color={theme.colors.primary} />
          <Text style={[styles.ratingText, { color: theme.text.primary }]}>
            {safeRating.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.reviewCountText, { color: theme.text.secondary }]}>
          {getReviewCountText()}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={theme.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  reviewCountText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
});

export { RatingsReviewsSection };
