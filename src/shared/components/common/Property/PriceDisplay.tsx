/**
 * PriceDisplay - Reusable price display component for properties
 * Shows price per night and optional total price
 */

import React from "react";
import { View, Text, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "src/shared/context";
import { fontSize, fontWeight, spacing } from "src/shared/constants";

export interface PriceDisplayProps {
  /** Price per night */
  price: number;
  /** Currency code (default: USD) */
  currency?: string;
  /** Number of nights for total calculation */
  nights?: number;
  /** Custom styles for price text */
  priceStyle?: TextStyle;
  /** Custom styles for "per night" text */
  perNightStyle?: TextStyle;
  /** Custom styles for total price text */
  totalPriceStyle?: TextStyle;
  /** Size variant */
  variant?: "small" | "large";
  /** Whether to show total price when nights > 1 */
  showTotal?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  currency = "USD",
  nights,
  priceStyle,
  perNightStyle,
  totalPriceStyle,
  variant = "large",
  showTotal = true,
}) => {
  const { theme, isDark } = useTheme();

  const textSize = variant === "small" ? fontSize.xs : fontSize.sm;
  const primaryColor = isDark ? theme.colors.gray[50] : theme.colors.gray[900];
  const secondaryColor = isDark
    ? theme.colors.gray[300]
    : theme.colors.gray[600];

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = nights ? price * nights : undefined;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.price,
          {
            fontSize: textSize,
            color: primaryColor,
          },
          priceStyle,
        ]}
      >
        {formatPrice(price)} 
        <Text
          style={[
            styles.perNight,
            {
              fontSize: textSize,
              color: primaryColor,
            },
            perNightStyle,
          ]}
        >
          night
        </Text>
      </Text>

      {showTotal && nights && nights > 1 && totalPrice && (
        <Text
          style={[
            styles.totalPrice,
            {
              fontSize: textSize,
              color: secondaryColor,
            },
            totalPriceStyle,
          ]}
        >
          · {formatPrice(totalPrice)} total
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontWeight: String(fontWeight.semibold) as any,
  },
  perNight: {
    fontWeight: String(fontWeight.normal) as any,
  },
  totalPrice: {
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: spacing.xs,
  },
});

export default PriceDisplay;
