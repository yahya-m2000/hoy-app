/**
 * Write Review Modal
 * Multi-step review flow with visual rating widgets
 * Converted from route-based screen to standalone modal component
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Vibration,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@core/hooks/useTheme";

// Components
import { Container, Button, Text } from "@shared/components";

// Services
import { ReviewService } from "@core/api/services";

// Constants
import { fontSize, spacing, radius } from "@core/design";

// Types
import { CreateReviewData } from "@core/types";

// Rating criteria with user-friendly labels and icons
const RATING_CRITERIA = [
  {
    key: "cleanliness" as const,
    label: "Cleanliness",
    description: "How clean was the property?",
    icon: "sparkles",
  },
  {
    key: "communication" as const,
    label: "Communication",
    description: "How was the host's communication?",
    icon: "chatbubbles",
  },
  {
    key: "checkIn" as const,
    label: "Check-in",
    description: "How smooth was the check-in process?",
    icon: "key",
  },
  {
    key: "accuracy" as const,
    label: "Accuracy",
    description: "How accurate was the listing description?",
    icon: "checkmark-circle",
  },
  {
    key: "location" as const,
    label: "Location",
    description: "How was the location?",
    icon: "location",
  },
  {
    key: "value" as const,
    label: "Value",
    description: "How was the value for money?",
    icon: "cash",
  },
] as const;

// Emoji rating system
const RATING_EMOJIS = [
  { value: 1, emoji: "😠", label: "Terrible" },
  { value: 2, emoji: "😞", label: "Poor" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😍", label: "Excellent" },
];

type RatingKey = (typeof RATING_CRITERIA)[number]["key"];

interface Ratings {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  propertyId: string;
  propertyName?: string;
  onReviewSubmitted?: () => void;
}

export default function WriteReviewModal({
  visible,
  onClose,
  bookingId,
  propertyId,
  propertyName,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [ratings, setRatings] = useState<Ratings>({
    cleanliness: 0,
    communication: 0,
    checkIn: 0,
    accuracy: 0,
    location: 0,
    value: 0,
  });
  const [overallRating, setOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setRatings({
        cleanliness: 0,
        communication: 0,
        checkIn: 0,
        accuracy: 0,
        location: 0,
        value: 0,
      });
      setOverallRating(0);
      setReviewText("");
      setIsSubmitting(false);
    }
  }, [visible]);

  // Calculate overall rating when individual ratings change
  useEffect(() => {
    const ratingsArray = Object.values(ratings).filter((rating) => rating > 0);
    if (ratingsArray.length > 0) {
      const average =
        ratingsArray.reduce((sum, rating) => sum + rating, 0) /
        ratingsArray.length;
      setOverallRating(Math.round(average));
    }
  }, [ratings]);

  const handleRatingSelect = (criterion: RatingKey, rating: number) => {
    // Add haptic feedback for better UX
    if (Vibration) {
      Vibration.vibrate(50);
    }

    setRatings((prev) => ({
      ...prev,
      [criterion]: rating,
    }));
  };

  const handleNext = () => {
    if (currentStep < RATING_CRITERIA.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!bookingId || !propertyId) {
      Alert.alert("Error", "Missing booking or property information");
      return;
    }

    // Validate that all ratings are provided
    const unratedCriteria = RATING_CRITERIA.filter(
      (criterion) => ratings[criterion.key] === 0
    );
    if (unratedCriteria.length > 0) {
      Alert.alert(
        "Missing Ratings",
        `Please rate: ${unratedCriteria.map((c) => c.label).join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReviewData = {
        bookingId,
        propertyId,
        overallRating,
        cleanliness: ratings.cleanliness,
        communication: ratings.communication,
        checkIn: ratings.checkIn,
        accuracy: ratings.accuracy,
        location: ratings.location,
        value: ratings.value,
        content: reviewText.trim() || "No additional comments",
      };

      await ReviewService.createReview(reviewData);

      Alert.alert(
        "Review Submitted!",
        "Thank you for sharing your experience!",
        [
          {
            text: "OK",
            onPress: () => {
              onReviewSubmitted?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModalHeader = () => (
    <Container
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="md"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
      }}
    >
      <View style={{ width: 40 }} />
      <Text
        style={[
          styles.headerTitle,
          {
            color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
          },
        ]}
      >
        Write Review
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        }
      />
    </Container>
  );

  const renderProgressIndicator = () => {
    const totalSteps = RATING_CRITERIA.length + 1; // +1 for review text step
    const progress = (currentStep / totalSteps) * 100;

    return (
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>
    );
  };

  const renderRatingStep = () => {
    const criterion = RATING_CRITERIA[currentStep];
    const currentRating = ratings[criterion.key];

    return (
      <View style={styles.stepContainer}>
        <View style={styles.criterionHeader}>
          <Ionicons
            name={criterion.icon as any}
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.criterionTitle,
              { color: isDark ? theme.white : theme.black },
            ]}
          >
            {criterion.label}
          </Text>
          <Text
            style={[
              styles.criterionDescription,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {criterion.description}
          </Text>
        </View>
        <View style={styles.ratingsContainer}>
          {RATING_EMOJIS.map((rating) => (
            <TouchableOpacity
              key={rating.value}
              style={[
                styles.ratingOption,
                currentRating === rating.value && styles.selectedRating,
                currentRating === rating.value && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primary}10`,
                },
              ]}
              onPress={() => handleRatingSelect(criterion.key, rating.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.ratingEmoji}>{rating.emoji}</Text>
              <Text
                style={[
                  styles.ratingLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                  currentRating === rating.value && {
                    color: theme.colors.primary,
                    fontWeight: "600",
                  },
                ]}
              >
                {rating.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.stepButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[
                styles.navigationButton,
                styles.secondaryButton,
                {
                  borderColor: isDark
                    ? theme.colors.gray[600]
                    : theme.colors.gray[400],
                },
              ]}
              onPress={handlePrevious}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isDark ? theme.white : theme.black },
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.primaryButton,
              {
                backgroundColor:
                  currentRating > 0
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
              },
            ]}
            onPress={handleNext}
            disabled={currentRating === 0}
          >
            <Text style={[styles.buttonText, { color: theme.white }]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReviewTextStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.criterionHeader}>
        <Ionicons name="create" size={32} color={theme.colors.primary} />
        <Text
          style={[
            styles.criterionTitle,
            { color: isDark ? theme.white : theme.black },
          ]}
        >
          Share Your Experience
        </Text>
        <Text
          style={[
            styles.criterionDescription,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          Tell future guests about your stay (optional)
        </Text>
      </View>

      <View style={styles.overallRatingDisplay}>
        <Text
          style={[
            styles.overallRatingLabel,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          Your Overall Rating
        </Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= overallRating ? "star" : "star-outline"}
              size={28}
              color={
                star <= overallRating
                  ? "#FFD700"
                  : isDark
                  ? theme.colors.gray[600]
                  : theme.colors.gray[400]
              }
            />
          ))}
          <Text
            style={[
              styles.ratingText,
              { color: isDark ? theme.white : theme.black },
            ]}
          >
            {overallRating}/5
          </Text>
        </View>
      </View>

      <TextInput
        style={[
          styles.reviewInput,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[50],
            borderColor: isDark
              ? theme.colors.gray[600]
              : theme.colors.gray[300],
            color: isDark ? theme.white : theme.black,
          },
        ]}
        placeholder="Share your thoughts about the property, host, or anything that would help future guests..."
        placeholderTextColor={
          isDark ? theme.colors.gray[500] : theme.colors.gray[500]
        }
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={2000}
      />

      <Text
        style={[
          styles.characterCount,
          {
            color: isDark ? theme.colors.gray[500] : theme.colors.gray[500],
          },
        ]}
      >
        {reviewText.length}/2000 characters
      </Text>

      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[
            styles.navigationButton,
            styles.secondaryButton,
            {
              borderColor: isDark
                ? theme.colors.gray[600]
                : theme.colors.gray[400],
            },
          ]}
          onPress={handlePrevious}
        >
          <Text
            style={[
              styles.buttonText,
              { color: isDark ? theme.white : theme.black },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navigationButton,
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.white }]}>
              Submit Review
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <ModalHeader />

        <Container flex={1}>
          {renderProgressIndicator()}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {currentStep < RATING_CRITERIA.length
              ? renderRatingStep()
              : renderReviewTextStep()}
          </ScrollView>
        </Container>
      </Container>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.sm,
    textAlign: "center",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  criterionHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  criterionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  criterionDescription: {
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
  ratingsContainer: {
    marginBottom: spacing.xl,
  },
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedRating: {
    borderWidth: 2,
  },
  ratingEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  ratingLabel: {
    fontSize: fontSize.lg,
    fontWeight: "500",
  },
  stepButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  navigationButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  overallRatingDisplay: {
    alignItems: "center",
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  overallRatingLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 120,
    marginBottom: spacing.sm,
  },
  characterCount: {
    fontSize: fontSize.sm,
    textAlign: "right",
    marginBottom: spacing.xl,
  },
});
