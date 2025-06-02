import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

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
  const { theme, isDark } = useTheme();

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
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.white,
          borderColor: isDark
            ? theme.colors.grayPalette[700]
            : theme.colors.grayPalette[200],
        },
      ]}
      onPress={onShowReviews}
    >
      <View style={styles.leftSection}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={theme.colors.primary} />
          <Text
            style={[
              styles.ratingText,
              {
                color: isDark
                  ? theme.colors.grayPalette[100]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            {rating.toFixed(1)}
          </Text>
        </View>{" "}
        <Text
          style={[
            styles.reviewCountText,
            {
              color: isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          {getReviewCountText()}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={
          isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "600",
  },
  reviewCountText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export { RatingsReviewsSection };
