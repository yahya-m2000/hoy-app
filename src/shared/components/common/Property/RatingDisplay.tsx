/**
 * RatingDisplay - Reusable rating and review count component
 * Shows star icon with rating value and optional review count
 */

import React from "react";
import { TextStyle } from "react-native";
import { Container, Text, Icon } from "@shared/components/base";
import { useTheme } from "src/shared/context";
import { fontSize, fontWeight } from "src/shared/constants";

export interface RatingDisplayProps {
  /** Rating value (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Text styles for rating */
  ratingStyle?: TextStyle;
  /** Text styles for review count */
  reviewCountStyle?: TextStyle;
  /** Size variant affects text size */
  variant?: "small" | "large";
  /** Star icon size */
  iconSize?: number;
}
const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  ratingStyle,
  reviewCountStyle,
  variant = "large",
  iconSize = 12,
}) => {
  const { theme, isDark } = useTheme();

  // Don't render if no rating
  if (rating === undefined) return null;

  const textSize = variant === "small" ? fontSize.xs : fontSize.sm;
  const defaultColor = isDark ? theme.colors.gray[50] : theme.colors.gray[900];
  const secondaryColor = isDark
    ? theme.colors.gray[300]
    : theme.colors.gray[600];

  return (
    <Container flexDirection="row" alignItems="center" style={{ gap: 2 }}>
      <Icon name="star" size={iconSize} color={defaultColor} />
      <Text
        style={[
          {
            fontSize: textSize,
            color: defaultColor,
            fontWeight: fontWeight.medium,
            marginLeft: 2,
          },
          ratingStyle,
        ]}
      >
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && reviewCount > 0 && (
        <Text
          style={[
            {
              fontSize: textSize,
              color: secondaryColor,
              fontWeight: fontWeight.normal,
              marginLeft: 2,
            },
            reviewCountStyle,
          ]}
        >
          ({reviewCount})
        </Text>
      )}
    </Container>
  );
};

export default RatingDisplay;
