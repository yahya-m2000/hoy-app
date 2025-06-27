/**
 * ReviewForm Component
 * Modal form for creating property reviews with multi-criteria ratings
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";
import { Modal } from "@shared/components/common/Modal";
import { Button } from "@shared/components/base";
import { ReviewService } from "@shared/services/api/review";
import { fontSize, spacing, radius } from "@shared/constants";
import type { CreateReviewData } from "@shared/types/review";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  propertyId: string;
  propertyName: string;
  onSuccess?: (review: any) => void;
}

interface RatingCriteria {
  key:
    | "overallRating"
    | "cleanliness"
    | "communication"
    | "checkIn"
    | "accuracy"
    | "location"
    | "value";
  label: string;
  icon: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onClose,
  bookingId,
  propertyId,
  propertyName,
  onSuccess,
}) => {
  const { theme } = useTheme();

  const [ratings, setRatings] = useState({
    overallRating: 0,
    cleanliness: 0,
    communication: 0,
    checkIn: 0,
    accuracy: 0,
    location: 0,
    value: 0,
  });

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingCriteria: RatingCriteria[] = [
    { key: "overallRating", label: "Overall Rating", icon: "star" },
    { key: "cleanliness", label: "Cleanliness", icon: "sparkles" },
    { key: "communication", label: "Communication", icon: "chatbubble" },
    { key: "checkIn", label: "Check-in", icon: "key" },
    { key: "accuracy", label: "Accuracy", icon: "checkmark-circle" },
    { key: "location", label: "Location", icon: "location" },
    { key: "value", label: "Value", icon: "card" },
  ];

  const handleRatingChange = (
    criterion: keyof typeof ratings,
    rating: number
  ) => {
    setRatings((prev) => ({ ...prev, [criterion]: rating }));
  };

  const renderStarRating = (
    criterion: keyof typeof ratings,
    label: string,
    icon: string
  ) => {
    return (
      <View key={criterion} style={styles.ratingRow}>
        <View style={styles.ratingLabel}>
          <Ionicons name={icon as any} size={20} color={theme.text.secondary} />
          <Text style={[styles.ratingLabelText, { color: theme.text.primary }]}>
            {label}
          </Text>
        </View>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRatingChange(criterion, star)}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= ratings[criterion] ? "star" : "star-outline"}
                size={24}
                color={
                  star <= ratings[criterion] ? "#FF385C" : theme.text.tertiary
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const handleSubmit = async () => {
    // Validate that all ratings are provided
    const hasAllRatings = Object.values(ratings).every((rating) => rating > 0);
    if (!hasAllRatings) {
      Alert.alert(
        "Missing Ratings",
        "Please provide ratings for all criteria."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert("Missing Review", "Please write a review about your stay.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReviewData = {
        bookingId,
        propertyId,
        content: content.trim(),
        ...ratings,
      };

      const review = await ReviewService.createReview(reviewData);

      Alert.alert(
        "Review Submitted",
        "Thank you for your review! It will help other travelers.",
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess?.(review);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        "Failed to submit your review. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRatings({
      overallRating: 0,
      cleanliness: 0,
      communication: 0,
      checkIn: 0,
      accuracy: 0,
      location: 0,
      value: 0,
    });
    setContent("");
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Review Your Stay">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Property Name */}
        <Text
          style={[styles.propertyName, { color: theme.text.secondary }]}
        ></Text>

        {/* Rating Criteria */}
        <View style={styles.ratingsSection}>
          {ratingCriteria.map((criterion) =>
            renderStarRating(criterion.key, criterion.label, criterion.icon)
          )}
        </View>

        {/* Written Review */}
        <View style={styles.reviewSection}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Tell us about your experience
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surface,
                color: theme.text.primary,
                borderColor: theme.border,
              },
            ]}
            placeholder="Share details about your stay..."
            placeholderTextColor={theme.text.tertiary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Submit Review"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyName: {
    fontSize: fontSize.md,
  },
  ratingsSection: {
    marginBottom: spacing.xl,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  ratingLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ratingLabelText: {
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  reviewSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 120,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});

export { ReviewForm };
