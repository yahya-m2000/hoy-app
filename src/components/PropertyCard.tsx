/**
 * PropertyCard component for the Hoy application
 * Displays property information in a card layout
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { fontSize, fontWeight } from "../constants/typography";
import { Ionicons } from "@expo/vector-icons";
import { useDateSelection } from "../context/DateSelectionContext";

interface PropertyCardProps {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  onPress?: () => void;
  style?: ViewStyle;
  city?: string;
  address?: string;
  hostId?: string;
  hostName?: string;
  hostImage?: string;
  onMessagePress?: () => void;
}

// Star Rating component - similar to what's in PropertyModalScreen
const StarRating: React.FC<{
  rating: number;
  size?: number;
  color?: string;
}> = ({ rating, size = 14, color }) => {
  const { theme } = useTheme();
  const starColor = color || theme.primary; // Use theme primary color if no color provided

  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons key={`star-${i}`} name="star" size={size} color={starColor} />
    );
  }

  // Add half star if needed
  if (halfStar) {
    stars.push(
      <Ionicons
        key="star-half"
        name="star-half"
        size={size}
        color={starColor}
      />
    );
  }

  // Add empty stars to complete 5 stars total
  for (let i = 0; i < 5 - fullStars - (halfStar ? 1 : 0); i++) {
    stars.push(
      <Ionicons
        key={`star-outline-${i}`}
        name="star-outline"
        size={size}
        color={starColor}
      />
    );
  }

  return <>{stars}</>;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  _id,
  title,
  location,
  price,
  currency = "USD",
  imageUrl,
  images,
  rating,
  reviewCount,
  onPress,
  style,
  // Accept city and address as props for flexibility
  city,
  address,
  hostId,
  hostName,
  hostImage,
  onMessagePress,
}) => {
  const { theme, isDark } = useTheme();
  const { getOptimalDatesForProperty, getDisplayDatesForProperty } =
    useDateSelection(); // Pre-fetch optimal dates when property card is rendered
  // This improves UX by having the dates ready when user views property details
  useEffect(() => {
    // Fetch optimal dates in the background
    const fetchOptimalDates = async () => {
      try {
        await getOptimalDatesForProperty(_id);
      } catch (_err) {
        // Silent fail - this is just pre-fetching
        console.log(
          `Could not pre-fetch optimal dates for property ${_id}: ${_err}`
        );
      }
    };

    fetchOptimalDates();
  }, [_id, getOptimalDatesForProperty]);

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price); // Determine the image source
  const getImageSource = () => {
    // If we have an array of images, use the first one
    if (images && images.length > 0 && images[0]) {
      return { uri: images[0] };
    }
    // Otherwise try the imageUrl prop
    if (imageUrl) {
      return { uri: imageUrl };
    }
    // Fall back to placeholder image
    return require("../assets/placeholder-property.png");
  };
  // Format location for display
  const locationLine =
    typeof location === "string" ? location : `${city || ""}, ${address || ""}`;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.background }, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Property: ${title} in ${locationLine}, ${formattedPrice} per night`}
    >
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        <Text
          style={[
            styles.location,
            { color: isDark ? theme.colors.gray[300] : theme.colors.gray[600] },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          <Ionicons
            name="location"
            size={12}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
          />
          {locationLine}
        </Text>
        {/* Star Rating Row */}
        {rating !== undefined && (
          <View style={styles.starsContainer}>
            <StarRating rating={rating} size={14} />
            {reviewCount !== undefined && reviewCount > 0 && (
              <Text
                style={[
                  styles.reviews,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </Text>
            )}
          </View>
        )}
        {/* Available dates with price */}
        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {formattedPrice} <Text style={styles.perNight}>night</Text>
          </Text>

          {/* Available dates badge */}
          <View
            style={[
              styles.datesBadge,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[100],
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={12}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.datesText,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700],
                },
              ]}
            >
              {getDisplayDatesForProperty(_id)}
            </Text>
          </View>
        </View>
        {/* Message Host Button */}
        {hostId && onMessagePress && (
          <TouchableOpacity
            style={[
              styles.messageButton,
              {
                backgroundColor: theme.colors.primary[500],
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onMessagePress();
            }}
          >
            <Ionicons name="chatbubble-outline" size={16} color="white" />
            <Text style={styles.messageButtonText}>Message Host</Text>
          </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
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
    fontWeight: String(fontWeight.semibold) as any,
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
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
  },
  datesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  datesText: {
    fontSize: fontSize.xs,
    marginLeft: 4,
    fontWeight: String(fontWeight.medium) as any,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  messageButtonText: {
    color: "white",
    fontSize: fontSize.sm,
    marginLeft: 4,
    fontWeight: String(fontWeight.medium) as any,
  },
});

export default PropertyCard;
