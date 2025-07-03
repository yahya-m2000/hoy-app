import React from "react";
import { Container } from "@shared/components/layout/Container";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@core/hooks/useTheme";
import { StarRating } from "./StarRating";

interface ReviewsSummaryProps {
  averageRating: number;
  totalReviews: number;
  categoryAverages: Record<string, number>;
}

export const ReviewsSummary: React.FC<ReviewsSummaryProps> = ({
  averageRating,
  totalReviews,
  categoryAverages,
}) => {
  const { theme } = useTheme();

  if (totalReviews === 0) return null;

  return (
    <Container
      paddingHorizontal="lg"
      paddingVertical="md"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      {/* Overall Rating */}
      <Container
        flexDirection="row"
        alignItems="center"
        marginBottom="md"
        style={{ gap: 12 }}
      >
        <Text variant="h2" weight="bold" color={theme.text.primary}>
          {averageRating.toFixed(1)}
        </Text>
        <StarRating rating={averageRating} size={20} />
        <Text variant="body" color={theme.text.secondary}>
          ({totalReviews})
        </Text>
      </Container>

      {/* Category Ratings */}
      <Container style={{ gap: 8 }}>
        {Object.entries(categoryAverages).map(([category, rating]) => (
          <Container
            key={category}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="xs"
          >
            <Text
              variant="body"
              color={theme.text.secondary}
              style={{ flex: 1 }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Container
              flexDirection="row"
              alignItems="center"
              style={{ gap: 8 }}
            >
              <Text
                variant="body"
                weight="medium"
                color={theme.text.primary}
                style={{ minWidth: 24, textAlign: "right" }}
              >
                {rating.toFixed(1)}
              </Text>
              <StarRating rating={rating} size={14} />
            </Container>
          </Container>
        ))}
      </Container>
    </Container>
  );
};
