/**
 * PropertyCard component for the Hoy application
 * Displays property information in a card layout
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import spacing from "../constants/spacing";
import radius from "../constants/radius";
import typography, { fontSize, fontWeight } from "../constants/typography";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  onPress: (id: string) => void;
  style?: ViewStyle;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  price,
  currency = "USD",
  imageUrl,
  rating,
  reviewCount,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.background }, style]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={`Property: ${title} in ${location}, ${formattedPrice} per night`}
    >
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require("../assets/placeholder-property.png")
          }
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: theme.text.primary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Text style={[styles.rating, { color: theme.text.primary }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.location, { color: theme.text.secondary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {location}
        </Text>

        <Text style={[styles.price, { color: theme.text.primary }]}>
          {formattedPrice}{" "}
          <Text style={[styles.perNight, { color: theme.text.secondary }]}>
            / night
          </Text>
        </Text>

        {reviewCount !== undefined && reviewCount > 0 && (
          <Text style={[styles.reviews, { color: theme.text.secondary }]}>
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 200,
    width: "100%",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: String(fontWeight.medium) as any,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  rating: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.bold) as any,
  },
  location: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: String(fontWeight.bold) as any,
  },
  perNight: {
    fontWeight: String(fontWeight.normal) as any,
    fontSize: fontSize.sm,
  },
  reviews: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default PropertyCard;
