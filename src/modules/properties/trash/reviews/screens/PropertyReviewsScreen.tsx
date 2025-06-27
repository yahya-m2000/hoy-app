import React from "react";
import { Container, Text, Icon } from "@shared/components/base";
import { DetailScreen } from "@shared/components/base/Screen/ScreenPatterns";
import { useTheme } from "@shared/hooks/useTheme";

// Import local components and hooks
import { usePropertyReviews, useReviewStats } from "../hooks";
import { ReviewsSummary, ReviewCard, EmptyReviews } from "../components";

interface PropertyReviewsScreenProps {
  propertyId: string;
}

/**
 * PropertyReviewsScreen - Displays all reviews for a property
 * Features: rating summary, category breakdowns, individual review cards
 */
export const PropertyReviewsScreen: React.FC<PropertyReviewsScreenProps> = ({
  propertyId,
}) => {
  const { theme } = useTheme();

  // Fetch reviews data
  const { data: reviews, isLoading, error } = usePropertyReviews(propertyId);

  // Calculate review statistics
  const { averageRating, categoryAverages, totalReviews } =
    useReviewStats(reviews);

  // Loading state
  if (isLoading) {
    return (
      <DetailScreen title="Reviews" headerVariant="solid" loading={true}>
        <Container flex={1} justifyContent="center" alignItems="center">
          <Text variant="body" color={theme.text.secondary}>
            Loading reviews...
          </Text>
        </Container>
      </DetailScreen>
    );
  }

  // Error state
  if (error) {
    return (
      <DetailScreen
        title="Reviews"
        headerVariant="solid"
        error={error?.message || "Unable to load reviews"}
      >
        <Container
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="xl"
        >
          <Icon name="alert-circle" size={48} color={theme.colors.gray[400]} />
          <Text
            variant="body"
            color={theme.text.secondary}
            style={{ marginTop: 16, textAlign: "center" }}
          >
            {error?.message || "Unable to load reviews"}
          </Text>
        </Container>
      </DetailScreen>
    );
  }

  return (
    <DetailScreen title="Reviews" headerVariant="solid">
      {/* Reviews Summary */}
      {totalReviews > 0 && (
        <ReviewsSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
          categoryAverages={categoryAverages}
        />
      )}

      {/* Reviews List */}
      <Container paddingHorizontal="lg">
        {totalReviews > 0 ? (
          <Container>
            {reviews?.map((review, index) => (
              <ReviewCard
                key={review._id || index}
                review={review}
                averageRating={averageRating}
              />
            ))}
            {/* Bottom spacing */}
            <Container height={20}>{null}</Container>
          </Container>
        ) : (
          <EmptyReviews />
        )}
      </Container>
    </DetailScreen>
  );
};
