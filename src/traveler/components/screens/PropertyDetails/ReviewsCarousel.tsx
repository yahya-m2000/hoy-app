import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

interface ReviewsCarouselProps {
  reviews: Review[];
  onShowAllReviews: () => void;
}

const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({
  reviews,
  onShowAllReviews,
}) => {
  const { theme, isDark } = useTheme();

  const topReviews = reviews.slice(0, 10);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark
                ? theme.colors.grayPalette[100]
                : theme.colors.grayPalette[900],
            },
          ]}
        >
          Reviews
        </Text>
        {reviews.length > 3 && (
          <TouchableOpacity onPress={onShowAllReviews}>
            <Text style={[styles.showAllText, { color: theme.colors.primary }]}>
              Show all ({reviews.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {topReviews.map((review, index) => (
          <View
            key={review.id || index}
            style={[
              styles.reviewCard,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.white,
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
              },
            ]}
          >
            <View style={styles.reviewHeader}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[200],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[300]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  {review.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reviewInfo}>
                <Text
                  style={[
                    styles.userName,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[100]
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {review.userName}
                </Text>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={
                        i < review.rating
                          ? theme.colors.primary
                          : isDark
                          ? theme.colors.grayPalette[600]
                          : theme.colors.grayPalette[300]
                      }
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text
              style={[
                styles.comment,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
              numberOfLines={4}
            >
              {review.comment}
            </Text>
            <Text
              style={[
                styles.date,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[500],
                },
              ]}
            >
              {review.date}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContainer: {
    paddingRight: spacing.md,
  },
  reviewCard: {
    width: 280,
    padding: spacing.md,
    marginRight: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: 12,
  },
});

export { ReviewsCarousel };
