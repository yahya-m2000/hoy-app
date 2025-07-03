import React from "react";
import { Container } from "@shared/components/layout/Container";
import { Icon } from "@shared/components/base/Icon";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@core/hooks/useTheme";

interface StarRatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  showNumber = false,
}) => {
  const { theme } = useTheme();

  return (
    <Container flexDirection="row" alignItems="center">
      <Container flexDirection="row" style={{ gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={
              star <= rating ? theme.colors.primary : theme.colors.gray[400]
            }
          />
        ))}
      </Container>
      {showNumber && (
        <Container marginLeft="xs">
          <Text variant="body" color={theme.text.secondary}>
            {rating.toFixed(1)}
          </Text>
        </Container>
      )}
    </Container>
  );
};
