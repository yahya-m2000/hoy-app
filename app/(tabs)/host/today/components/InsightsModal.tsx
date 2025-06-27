import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentHostInsights } from "../hooks";
import type { PropertyInsights } from "../hooks";

interface InsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PropertyDetailModalProps {
  visible: boolean;
  property: PropertyInsights | null;
  onClose: () => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  visible,
  property,
  onClose,
}) => {
  const { theme } = useTheme();

  if (!property) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFB400" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFB400" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#FFB400"
        />
      );
    }
    return stars;
  };
  const categoryNames = {
    cleanliness: "Cleanliness",
    accuracy: "Accuracy",
    checkIn: "Check-in",
    communication: "Communication",
    location: "Location",
    value: "Value",
  };

  const renderRatingBar = (
    rating: number,
    category: string,
    count?: number
  ) => {
    const percentage = (rating / 5) * 100;
    const barColor =
      rating >= 4.5 ? "#E91E63" : rating >= 4 ? "#FF9800" : "#9E9E9E";

    return (
      <View key={category} style={styles.ratingBarContainer}>
        <View style={styles.ratingBarHeader}>
          <Text style={[styles.categoryLabel, { color: theme.text.primary }]}>
            {categoryNames[category as keyof typeof categoryNames]}
          </Text>
          <Text style={[styles.categoryValue, { color: theme.text.primary }]}>
            {rating.toFixed(1)} ★
          </Text>
        </View>
        <View
          style={[styles.ratingBarTrack, { backgroundColor: theme.border }]}
        >
          <View
            style={[
              styles.ratingBarFill,
              { width: `${percentage}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        {/* Placeholder tags */}
        <View style={styles.tagsContainer}>
          {category === "checkIn" && (
            <>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Responsive host</Text>
                <Text style={styles.tagCount}>({count || 38})</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Easy to find</Text>
                <Text style={styles.tagCount}>({count || 20})</Text>
              </View>
            </>
          )}
          {category === "cleanliness" && (
            <>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Free of clutter</Text>
                <Text style={styles.tagCount}>({count || 12})</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Pristine kitchen</Text>
                <Text style={styles.tagCount}>({count || 7})</Text>
              </View>
            </>
          )}
          {category === "accuracy" && (
            <>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Easy to find</Text>
                <Text style={styles.tagCount}>({count || 12})</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Clear instructions</Text>
                <Text style={styles.tagCount}>({count || 7})</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Homes
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View
          style={[styles.tabsContainer, { borderBottomColor: theme.border }]}
        >
          <View style={styles.tabs}>
            <View
              style={[
                styles.activeTab,
                { backgroundColor: theme.text.primary },
              ]}
            >
              <Text style={[styles.activeTabText, { color: theme.background }]}>
                Reviews
              </Text>
            </View>
            <Text
              style={[styles.inactiveTabText, { color: theme.text.secondary }]}
            >
              Stats
            </Text>
            <Text
              style={[styles.inactiveTabText, { color: theme.text.secondary }]}
            >
              Opportunities
            </Text>
            <Text
              style={[styles.inactiveTabText, { color: theme.text.secondary }]}
            >
              Superhost
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Property Title */}
          <View style={styles.propertyTitleContainer}>
            <Text
              style={[styles.propertyTitleText, { color: theme.text.primary }]}
            >
              {property.title}
            </Text>
          </View>
          {/* Overall Rating */}
          <View style={styles.overallRatingSection}>
            <View style={styles.ratingDisplayRow}>
              <Text
                style={[styles.ratingValueLarge, { color: theme.text.primary }]}
              >
                {property.averageRating.toFixed(2)} ★
              </Text>
              <Text
                style={[styles.totalReviewsText, { color: theme.text.primary }]}
              >
                {property.totalReviews}
              </Text>
            </View>
            <View style={styles.ratingLabels}>
              <Text
                style={[
                  styles.overallRatingLabel,
                  { color: theme.text.secondary },
                ]}
              >
                Overall rating
              </Text>
              <Text
                style={[
                  styles.totalReviewsLabel,
                  { color: theme.text.secondary },
                ]}
              >
                Total reviews
              </Text>
            </View>
          </View>
          {/* Category Ratings */}
          <View
            style={[
              styles.categoriesContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Rating breakdown
            </Text>

            {Object.entries(property.categoryAverages).map(([key, value]) =>
              renderRatingBar(value, key, property.totalReviews)
            )}
          </View>
          {/* Recent Reviews */}
          {property.recentReviews && property.recentReviews.length > 0 && (
            <View
              style={[
                styles.reviewsContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: theme.text.primary }]}
              >
                Recent reviews
              </Text>

              {property.recentReviews.slice(0, 3).map((review, index) => (
                <View key={review._id || index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.guestInfo}>
                      {review.guest.avatarUrl ? (
                        <Image
                          source={{ uri: review.guest.avatarUrl }}
                          style={styles.guestAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.guestAvatar,
                            styles.guestAvatarPlaceholder,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        >
                          <Text style={styles.guestInitial}>
                            {review.guest.firstName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text
                          style={[
                            styles.guestName,
                            { color: theme.text.primary },
                          ]}
                        >
                          {review.guest.firstName} {review.guest.lastName}
                        </Text>
                        <View style={styles.reviewRating}>
                          {renderStars(review.overallRating)}
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.reviewComment,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const InsightsModal: React.FC<InsightsModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: insightsData, isLoading, error } = useCurrentHostInsights();
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyInsights | null>(null);

  // Enhanced debug logging for insights data
  console.log("📊 [InsightsModal] Insights Modal Data:", {
    insightsData,
    isLoading,
    error,
    propertiesCount: insightsData?.properties?.length,
  });

  /**
   * Handle property press to navigate to property insights screen
   * @param property The property that was pressed
   */
  const handlePropertyPress = (property: PropertyInsights) => {
    console.log("🏠 [InsightsModal] Property pressed:", {
      propertyId: property._id,
      propertyTitle: property.title,
      propertyRating: property.averageRating,
    });

    // Close modal first
    onClose();

    // Navigate to property insights screen
    router.push(`/(tabs)/host/insights/${property._id}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={20} color="#FFB400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={20} color="#FFB400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={20}
          color="#FFB400"
        />
      );
    }

    return stars;
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Insights
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[styles.loadingText, { color: theme.text.secondary }]}
                >
                  Loading insights...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="warning-outline"
                  size={48}
                  color={theme.colors.error}
                />
                <Text style={[styles.errorText, { color: theme.text.primary }]}>
                  Failed to load insights
                </Text>
                <Text
                  style={[styles.errorSubtext, { color: theme.text.secondary }]}
                >
                  Please try again later
                </Text>
              </View>
            ) : (
              <>
                {/* Overall Rating */}
                <View
                  style={[
                    styles.ratingContainer,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.sectionTitle, { color: theme.text.primary }]}
                  >
                    Overall rating
                  </Text>

                  <View style={styles.ratingDisplay}>
                    <Text
                      style={[
                        styles.ratingValue,
                        { color: theme.text.primary },
                      ]}
                    >
                      {insightsData?.averageRating?.toFixed(1) || "0.0"}
                    </Text>
                    <View style={styles.starsContainer}>
                      {renderStars(insightsData?.averageRating || 0)}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.reviewCount,
                      { color: theme.text.secondary },
                    ]}
                  >
                    Based on {insightsData?.totalReviews || 0} reviews
                  </Text>
                </View>
                {/* Properties List */}
                {insightsData?.properties &&
                insightsData.properties.length > 0 ? (
                  <View
                    style={[
                      styles.propertiesContainer,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.text.primary },
                      ]}
                    >
                      Your properties
                    </Text>
                    {insightsData.properties.map((property) => (
                      <TouchableOpacity
                        key={property._id}
                        style={[
                          styles.propertyItem,
                          { borderBottomColor: theme.border },
                        ]}
                        onPress={() => handlePropertyPress(property)}
                      >
                        <View style={styles.propertyContent}>
                          {property.images && property.images.length > 0 && (
                            <Image
                              source={{ uri: property.images[0] }}
                              style={styles.propertyThumbnail}
                              resizeMode="cover"
                            />
                          )}
                          <View style={styles.propertyInfo}>
                            <Text
                              style={[
                                styles.propertyTitle,
                                { color: theme.text.primary },
                              ]}
                              numberOfLines={1}
                            >
                              {property.title}
                            </Text>
                            <View style={styles.propertyRating}>
                              <Text
                                style={[
                                  styles.propertyRatingValue,
                                  { color: theme.text.primary },
                                ]}
                              >
                                {property.averageRating.toFixed(1)}
                              </Text>
                              <View style={styles.propertyStars}>
                                {renderStars(property.averageRating)}
                              </View>
                              <Text
                                style={[
                                  styles.propertyReviewCount,
                                  { color: theme.text.secondary },
                                ]}
                              >
                                · {property.totalReviews} reviews
                              </Text>
                            </View>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={theme.text.secondary}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="home-outline"
                      size={48}
                      color={theme.text.secondary}
                    />
                    <Text
                      style={[styles.emptyTitle, { color: theme.text.primary }]}
                    >
                      No properties yet
                    </Text>
                    <Text
                      style={[
                        styles.emptySubtext,
                        { color: theme.text.secondary },
                      ]}
                    >
                      Add your first property to start receiving reviews
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      {/* Property Detail Modal */}
      <PropertyDetailModal
        visible={!!selectedProperty}
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  // Tabs styles
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  activeTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inactiveTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Property title
  propertyTitleContainer: {
    paddingVertical: spacing.lg,
  },
  propertyTitleText: {
    fontSize: 20,
    fontWeight: "600",
  },
  // Overall rating section
  overallRatingSection: {
    marginBottom: spacing.xl,
  },
  ratingDisplayRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  ratingValueLarge: {
    fontSize: 32,
    fontWeight: "700",
  },
  totalReviewsText: {
    fontSize: 32,
    fontWeight: "700",
  },
  ratingLabels: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  overallRatingLabel: {
    fontSize: 16,
  },
  totalReviewsLabel: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: spacing.sm,
    fontSize: 16,
    textAlign: "center",
  },
  ratingContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.lg,
    alignSelf: "flex-start",
  },
  ratingDisplay: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginBottom: spacing.sm,
  },
  reviewCount: {
    fontSize: 16,
  },
  propertiesContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  propertyItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  propertyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyRatingValue: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  propertyStars: {
    flexDirection: "row",
    gap: 2,
    marginRight: spacing.xs,
  },
  propertyReviewCount: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: spacing.sm,
    fontSize: 16,
    textAlign: "center",
  },
  // Property Detail Modal Styles
  imageContainer: {
    marginTop: spacing.lg,
    borderRadius: 12,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 200,
  },
  categoriesContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  reviewsContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  reviewItem: {
    marginBottom: spacing.lg,
  },
  reviewHeader: {
    marginBottom: spacing.sm,
  },
  guestInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  guestAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  guestInitial: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
  }, // Rating bar styles
  ratingBarContainer: {
    marginBottom: spacing.lg,
  },
  ratingBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingBarTrack: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: "#666",
    marginRight: spacing.xs,
  },
  tagCount: {
    fontSize: 13,
    color: "#999",
  },
});

export default InsightsModal;
