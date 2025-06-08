/**
 * PropertyCard component for the Hoy application
 * Displays property information in a card layout with Airbnb-style design
 */

// React imports
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TouchableOpacity,
  Dimensions,
} from "react-native";

// Shared components and utilities
import {
  PropertyImageContainer,
  PropertyCollectionPreview,
  PropertyLocationDisplay,
  RatingDisplay,
  WishlistButton,
} from "@shared/components/common/";
import {
  useTheme,
  useDateSelection,
  radius,
  spacing,
  fontSize,
  fontWeight,

  // Property-specific components
} from "src/shared";

// Local components
import { CollectionsModal } from "../Modals";

// import { PropertyCardProps } from "src/shared/types";

interface PropertyCardProps {
  _id: string;
  name: string; // Updated from 'title' to 'name'
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  price: number;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  onPress?: () => void;
  style?: ViewStyle;
  hostId?: string;
  hostName?: string;
  hostImage?: string;
  onMessagePress?: () => void;
  variant?: "large" | "small" | "collection"; // Add collection variant

  // Collection-specific props
  collection?: {
    name: string;
    propertyCount: number;
    previewImages: string[];
    isLoading?: boolean;
  };

  // Legacy props for compatibility (deprecated)
  title?: string;
  location?: string | any;
  city?: string;
  country?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  _id,
  name,
  address,
  coordinates,
  price,
  currency = "USD",
  imageUrl,
  images,
  rating,
  reviewCount,
  onPress,
  style,
  hostId,
  hostName,
  hostImage,
  onMessagePress,
  variant = "large", // Add variant with default value
  collection, // Add collection prop
  // Legacy props for backward compatibility
  title,
  location,
  city,
  country,
}) => {
  const { theme, isDark } = useTheme();
  const { searchDates } = useDateSelection();

  // Collections modal state
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Calculate nights and total price
  const calculateStayDetails = () => {
    let nights = 3; // Default 3 nights
    let startDate = searchDates.startDate;
    let endDate = searchDates.endDate;

    // If we have search dates, use them to calculate nights
    if (startDate && endDate) {
      nights = Math.max(
        1,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    const totalPrice = price * nights;
    return { nights, totalPrice };
  };

  const { nights, totalPrice } = calculateStayDetails();

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }; // Format location for display using new address structure
  const getLocationDisplay = () => {
    // Use new address structure first
    if (address?.city && address?.country) {
      return `${address.city}, ${address.country}`;
    }

    if (address?.city && address?.state) {
      return `${address.city}, ${address.state}`;
    }

    if (address?.city) {
      return address.city;
    }

    // Fallback to legacy props for backward compatibility
    if (city && country) {
      return `${city}, ${country}`;
    }

    if (city) {
      return city;
    }

    // Handle legacy string location (for backward compatibility)
    if (typeof location === "string" && location.trim()) {
      return location;
    }

    // Handle legacy location object
    if (typeof location === "object" && location) {
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }

      if (location.city) {
        return location.city;
      }

      // Handle nested address object in legacy structure
      if (location.address) {
        const addr = location.address;
        if (addr.city && addr.country) {
          return `${addr.city}, ${addr.country}`;
        }
        if (addr.city && addr.state) {
          return `${addr.city}, ${addr.state}`;
        }
        if (addr.city) {
          return addr.city;
        }
      }

      // Note: Don't try to render GeoJSON location objects directly
      // They have {type: "Point", coordinates: [lat, lng]} structure
    }

    return "Location not available";
  };
  const locationLine = getLocationDisplay();

  // Handle collection toggle callback
  const handleCollectionToggle = (collectionId: string, isAdded: boolean) => {
    // Optional: Add any additional logic when property is added/removed from collections
    console.log(
      `Property ${_id} ${
        isAdded ? "added to" : "removed from"
      } collection ${collectionId}`
    );
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    if (variant === "small") {
      // For small variant, we make it a perfect square based on the container width
      const smallCardSize = 200; // Fixed size for perfect square

      return {
        container: {
          borderRadius: radius.md, // More rounded corners for carousel items
          overflow: "hidden" as "hidden",
          paddingBottom: 0, // Override the default padding
        },
        imageContainer: {
          position: "relative" as "relative",
          backgroundColor: "black",
          height: smallCardSize * 0.8, // 60% for image
          width: smallCardSize,
          borderTopLeftRadius: radius.md,
          borderTopRightRadius: radius.md,
          aspectRatio: undefined as any, // Override the aspectRatio from default styles
          marginBottom: 0, // Remove margin to keep container tight
          overflow: "hidden" as "hidden",
        },
        image: {
          borderTopLeftRadius: radius.md,
          borderTopRightRadius: radius.md,
        },
        detailsContainer: {
          height: smallCardSize * 0.4, // 40% for details
          paddingTop: spacing.xs,
          paddingBottom: spacing.xs,
          justifyContent: "space-between" as "space-between",
        },
        location: {
          fontSize: fontSize.xs,
          marginBottom: 1,
          lineHeight: fontSize.xs * 1.1,
        },
        title: {
          fontSize: fontSize.xs,
          marginBottom: 1,
          lineHeight: fontSize.xs * 1.1,
          overflow: "hidden" as "hidden",
        },
        availability: {
          fontSize: fontSize.xs - 1,
          lineHeight: (fontSize.xs - 1) * 1.1,
        },
        price: {
          fontSize: fontSize.xs,
          lineHeight: fontSize.xs * 1.1,
        },
        perNight: {
          fontSize: fontSize.xs,
          lineHeight: fontSize.xs * 1.1,
        },
        totalPrice: {
          fontSize: fontSize.xs,
          lineHeight: fontSize.xs * 1.1,
        },
        heartButton: {
          position: "absolute" as "absolute",
          top: spacing.xs,
          right: spacing.xs,
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: "center" as "center",
          justifyContent: "center" as "center",
          // Smaller shadow for small variant
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.5,
          elevation: 2,
        },
        ratingText: {
          fontSize: fontSize.xs,
        },
        reviewCount: {
          fontSize: fontSize.xs,
        },
      };
    }

    if (variant === "collection") {
      const { width } = Dimensions.get("window");
      const cardWidth = (width - spacing.lg * 3) / 2;

      return {
        container: {
          width: cardWidth,
          marginBottom: spacing.md,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          paddingBottom: 0,
        },
        imageContainer: {
          height: cardWidth * 0.75,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: "hidden" as "hidden",
          flexDirection: "row" as "row",
          aspectRatio: undefined as any,
          marginBottom: 0,
        },
        image: {
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        },
        detailsContainer: {
          padding: spacing.md,
          height: "auto",
        },
        title: {
          fontSize: fontSize.md,
          fontWeight: fontWeight.semibold,
          marginBottom: spacing.xs,
        },
        propertyCount: {
          fontSize: fontSize.sm,
        },
      };
    }

    return {};
  };
  const variantStyles = getVariantStyles();

  // For collection variant, render collection layout
  if (variant === "collection") {
    return (
      <TouchableOpacity
        style={[styles.container, variantStyles.container, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <PropertyCollectionPreview
          collection={collection}
          style={[styles.imageContainer, variantStyles.imageContainer]}
        />
        <View style={[styles.detailsContainer, variantStyles.detailsContainer]}>
          <Text
            style={[
              styles.title,
              variantStyles.title,
              { color: theme.text.primary },
            ]}
            numberOfLines={1}
          >
            {collection?.name || name || title || "Collection"}
          </Text>
          <Text
            style={[
              styles.propertyCount,
              variantStyles.propertyCount,
              { color: theme.text.secondary },
            ]}
          >
            {collection?.propertyCount || 0}{" "}
            {(collection?.propertyCount || 0) === 1 ? "property" : "properties"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  // Regular property card layout (large or small variants)
  return (
    <Pressable
      style={[styles.container, variantStyles.container, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Property: ${
        name || title || "Property"
      } in ${locationLine}, ${formatPrice(price)} per night`}
    >
      {" "}
      {/* Image Container with Heart Button */}
      <PropertyImageContainer
        imageUrl={imageUrl}
        images={images}
        variant={variant}
        containerStyle={[
          styles.imageContainer,
          variantStyles.imageContainer,
        ].reduce((acc, style) => ({ ...acc, ...style }), {})}
        imageStyle={[styles.image, variantStyles.image].reduce(
          (acc, style) => ({ ...acc, ...style }),
          {}
        )}
        resizeMode={variant === "small" ? "cover" : "cover"}
      >
        <WishlistButton
          propertyId={_id}
          variant={variant}
          onShowCollections={() => setShowCollectionsModal(true)}
          onCollectionToggle={handleCollectionToggle}
        />
      </PropertyImageContainer>{" "}
      {/* Property Details */}
      <View style={[styles.detailsContainer, variantStyles.detailsContainer]}>
        {/* Location and Rating Row */}
        <View style={styles.locationRatingRow}>
          <PropertyLocationDisplay
            address={address}
            location={location}
            city={city}
            country={country}
            variant={variant}
            style={{
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              flex: 1,
              marginRight: spacing.sm,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          />

          <RatingDisplay
            rating={rating}
            reviewCount={reviewCount}
            variant={variant}
            iconSize={12}
            ratingStyle={{
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            }}
            reviewCountStyle={{
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
            }}
          />
        </View>{" "}
        {/* Property Title */}
        <Text
          style={[
            styles.title,
            variantStyles.title,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name || title || "Property"}
        </Text>
        {/* Availability Text */}
        <Text
          style={[
            styles.availability,
            variantStyles.availability,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
            },
          ]}
        >
          {searchDates.startDate && searchDates.endDate
            ? `${searchDates.startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${searchDates.endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : "Available year round"}
        </Text>
        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              variantStyles.price,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {formatPrice(price)}{" "}
            <Text
              style={[
                styles.perNight,
                variantStyles.perNight,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              night
            </Text>
          </Text>

          {nights > 1 && (
            <Text
              style={[
                styles.totalPrice,
                variantStyles.totalPrice,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              · {formatPrice(totalPrice)} total
            </Text>
          )}
        </View>
      </View>{" "}
      <CollectionsModal
        visible={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        propertyId={_id}
        onCollectionToggle={handleCollectionToggle}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // ===== MAIN CONTAINER =====
  container: {
    paddingBottom: spacing.lg,
    backgroundColor: "transparent",
  },

  // ===== IMAGE SECTION =====
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1, // 1:1 ratio for square image
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },
  heartButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // ===== CONTENT SECTION =====
  detailsContainer: {
    // paddingHorizontal: spacing.xs,
  },

  // ===== LOCATION & RATING ROW =====
  locationRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.semibold) as any,
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.medium) as any,
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: 2,
  },

  // ===== PROPERTY TITLE =====
  title: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    lineHeight: fontSize.sm * 1.2,
  },

  // ===== AVAILABILITY =====
  availability: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginBottom: spacing.xs,
  },

  // ===== PRICE SECTION =====
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.semibold) as any,
  },
  perNight: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
  },
  totalPrice: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: spacing.xs,
  },

  // ===== LEGACY/UNUSED STYLES (kept for compatibility) =====
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
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

  // ===== COLLECTION VARIANT STYLES =====
  previewContainer: {
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },
  twoImageLeft: {
    width: "50%",
    height: "100%",
  },
  twoImageRight: {
    width: "50%",
    height: "100%",
    marginLeft: 1,
  },
  gridImageLarge: {
    width: "67%",
    height: "100%",
  },
  gridRight: {
    width: "33%",
    height: "100%",
    marginLeft: 1,
  },
  gridImageSmall: {
    width: "100%",
    height: "50%",
  },
  gridImageSmallBottom: {
    marginTop: 1,
  },
  propertyCount: {
    fontSize: fontSize.sm,
  },

  // ===== FALLBACK ICON STYLES =====
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fallbackIconWrapper: {
    borderRadius: 50,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PropertyCard;
