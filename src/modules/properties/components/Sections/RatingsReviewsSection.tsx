import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface RatingsReviewsSectionProps {
  rating: number;
  reviewCount: number;
  onShowReviews: () => void;
}

const RatingsReviewsSection: React.FC<RatingsReviewsSectionProps> = ({
  rating,
  reviewCount,
  onShowReviews,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Ensure reviewCount is a valid number
  const safeReviewCount =
    typeof reviewCount === "number" && !isNaN(reviewCount) ? reviewCount : 0; // Simple translation without problematic pluralization
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
      {" "}
      <View style={styles.leftSection}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#FF385C" />
          <Text style={[styles.ratingText, { color: theme.text.primary }]}>
            {rating.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.reviewCountText, { color: theme.text.secondary }]}>
          {getReviewCountText()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.text.tertiary} />
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
