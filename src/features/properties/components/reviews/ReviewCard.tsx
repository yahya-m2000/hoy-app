import React from "react";
import { Container } from "@shared/components/layout/Container";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@core/hooks/useTheme";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: {
    _id?: string;
    author?: {
      firstName?: string;
      lastName?: string;
    };
    content?: string;
    createdAt: string;
    cleanliness?: number;
    accuracy?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
  averageRating: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  averageRating,
}) => {
  const { theme } = useTheme();

  const getUserInitial = () => {
    return (review.author?.firstName?.[0] || "A").toUpperCase();
  };

  const getUserName = () => {
    if (review.author?.firstName && review.author?.lastName) {
      return `${review.author.firstName} ${review.author.lastName}`;
    }
    return "Anonymous";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container
      paddingVertical="lg"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      {/* User Info and Rating */}
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        marginBottom="sm"
      >
        <Container flexDirection="row" alignItems="flex-start" flex={1}>
          {/* Avatar */}
          <Container
            width={40}
            height={40}
            borderRadius="circle"
            backgroundColor={theme.colors.primary}
            justifyContent="center"
            alignItems="center"
            marginRight="md"
          >
            <Text variant="body" weight="semibold" color="white">
              {getUserInitial()}
            </Text>
          </Container>

          {/* User Details */}
          <Container>
            <Text variant="body" weight="semibold" color={theme.text.primary}>
              {getUserName()}
            </Text>
            <Text variant="caption" color={theme.text.secondary}>
              {formatDate(review.createdAt)}
            </Text>
          </Container>
        </Container>

        {/* Rating */}
        <StarRating rating={averageRating} />
      </Container>

      {/* Review Comment */}
      {review.content && (
        <Text
          variant="body"
          color={theme.text.primary}
          style={{ lineHeight: 22, marginTop: 4 }}
        >
          {review.content}
        </Text>
      )}
    </Container>
  );
};
