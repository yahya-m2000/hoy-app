/**
 * Create Review Modal for the Hoy application
 * Allows users to leave reviews for properties they've stayed at
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import BottomSheetModal from "../../src/components/BottomSheetModal";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useToast } from "../../src/context/ToastContext";
import { useCreateBookingReview } from "../../src/hooks/useBookings";

interface RatingItem {
  id: string;
  title: string;
  description: string;
  rating: number;
}

export default function CreateReviewModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const params = useLocalSearchParams();

  // Get booking and property IDs
  const bookingId = params.bookingId as string;
  const propertyId = params.propertyId as string;

  // Review mutation
  const createReviewMutation = useCreateBookingReview(bookingId);

  // Rating state
  const [overallRating, setOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingItems, setRatingItems] = useState<RatingItem[]>([
    {
      id: "cleanRating",
      title: t("review.cleanliness"),
      description: t("review.cleanDescription"),
      rating: 0,
    },
    {
      id: "accuracyRating",
      title: t("review.accuracy"),
      description: t("review.accuracyDescription"),
      rating: 0,
    },
    {
      id: "locationRating",
      title: t("review.location"),
      description: t("review.locationDescription"),
      rating: 0,
    },
    {
      id: "valueRating",
      title: t("review.value"),
      description: t("review.valueDescription"),
      rating: 0,
    },
    {
      id: "communicationRating",
      title: t("review.communication"),
      description: t("review.communicationDescription"),
      rating: 0,
    },
  ]);

  // Handle star rating change
  const handleRatingChange = (itemId: string, rating: number) => {
    // Update the specific rating item
    const updatedItems = ratingItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, rating };
      }
      return item;
    });

    setRatingItems(updatedItems);

    // Calculate overall rating (average of all ratings)
    const totalRatings = updatedItems.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    const avgRating = totalRatings / updatedItems.length;
    setOverallRating(Math.round(avgRating));
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    // Check if all ratings are provided
    const hasAllRatings = ratingItems.every((item) => item.rating > 0);
    if (!hasAllRatings) {
      showToast({
        type: "error",
        message: t("review.allRatingsRequired"),
      });
      return;
    }

    // Check if review text is provided
    if (!reviewText.trim()) {
      showToast({
        type: "error",
        message: t("review.textRequired"),
      });
      return;
    }

    // Create review data
    const reviewData = {
      propertyId,
      rating: overallRating,
      comment: reviewText,
      categories: Object.fromEntries(
        ratingItems.map((item) => [item.id.replace("Rating", ""), item.rating])
      ),
    };

    // Submit review
    createReviewMutation.mutate(reviewData, {
      onSuccess: () => {
        showToast({
          type: "success",
          message: t("review.success"),
        });
        router.back();
      },
      onError: (error) => {
        showToast({
          type: "error",
          message: error.message || t("review.error"),
        });
      },
    });
  };

  // Render star rating
  const renderStarRating = (
    itemId: string,
    currentRating: number,
    size = 30
  ) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={`${itemId}-${star}`}
            onPress={() => handleRatingChange(itemId, star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={size}
              color={
                star <= currentRating
                  ? theme.colors.warning[500]
                  : isDark
                  ? theme.colors.gray[600]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <BottomSheetModal
      title={t("review.writeReview")}
      showSaveButton={false}
      fullHeight={true}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Overall Rating */}
        <View style={styles.overallRatingContainer}>
          <Text
            style={[
              styles.overallRatingTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("review.rateYourStay")}
          </Text>

          <View style={styles.overallStarContainer}>
            {renderStarRating("overallRating", overallRating, 40)}
          </View>

          <Text
            style={[
              styles.ratingText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {overallRating === 0
              ? t("review.tapToRate")
              : overallRating === 1
              ? t("review.terrible")
              : overallRating === 2
              ? t("review.poor")
              : overallRating === 3
              ? t("review.average")
              : overallRating === 4
              ? t("review.veryGood")
              : t("review.excellent")}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Individual Ratings */}
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("review.rateCategories")}
        </Text>

        {ratingItems.map((item) => (
          <View key={item.id} style={styles.ratingItemContainer}>
            <View style={styles.ratingItemHeader}>
              <Text
                style={[
                  styles.ratingItemTitle,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.ratingItemValue,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {item.rating} / 5
              </Text>
            </View>
            <Text
              style={[
                styles.ratingItemDescription,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {item.description}
            </Text>
            {renderStarRating(item.id, item.rating)}
          </View>
        ))}

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Review Text */}
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("review.shareExperience")}
        </Text>

        <TextInput
          style={[
            styles.reviewInput,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
              color: isDark ? theme.white : theme.colors.gray[900],
            },
          ]}
          placeholder={t("review.reviewPlaceholder")}
          placeholderTextColor={
            isDark ? theme.colors.gray[500] : theme.colors.gray[400]
          }
          multiline
          numberOfLines={6}
          value={reviewText}
          onChangeText={setReviewText}
          maxLength={1000}
          textAlignVertical="top"
        />

        <Text
          style={[
            styles.characterCount,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
        >
          {reviewText.length}/1000
        </Text>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary[500],
              opacity: createReviewMutation.isPending ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmitReview}
          disabled={createReviewMutation.isPending}
        >
          {createReviewMutation.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t("review.submitReview")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  overallRatingContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  overallRatingTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  overallStarContainer: {
    marginVertical: spacing.md,
  },
  ratingText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  ratingItemContainer: {
    marginBottom: spacing.lg,
  },
  ratingItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingItemTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  ratingItemValue: {
    fontSize: fontSize.sm,
  },
  ratingItemDescription: {
    fontSize: fontSize.sm,
    marginVertical: spacing.xs,
  },
  starContainer: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  starButton: {
    padding: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 150,
    fontSize: fontSize.md,
  },
  characterCount: {
    fontSize: fontSize.sm,
    textAlign: "right",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submitButton: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  submitButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
