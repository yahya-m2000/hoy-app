/**
 * RatingDisplay - Reusable rating and review count component
 * Shows star icon with rating value and optional review count
 */

import React from "react";
import { View, Text, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "src/shared/context";
import { fontSize, fontWeight } from "src/shared/constants";
import { Icon } from "src/shared/components/base/Icon";

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
    <View style={styles.container}>
      <Icon name="star" size={iconSize} color={defaultColor} />
      <Text
        style={[
          styles.ratingText,
          {
            fontSize: textSize,
            color: defaultColor,
          },
          ratingStyle,
        ]}
      >
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && reviewCount > 0 && (
        <Text
          style={[
            styles.reviewCount,
            {
              fontSize: textSize,
              color: secondaryColor,
            },
            reviewCountStyle,
          ]}
        >
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontWeight: String(fontWeight.medium) as any,
    marginLeft: 2,
  },
  reviewCount: {
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: 2,
  },
});

export default RatingDisplay;
