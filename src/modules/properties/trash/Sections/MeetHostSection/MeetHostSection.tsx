import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";

// Types
import { MeetHostSectionProps } from "../../types/sections";

// Constants
import { spacing, radius } from "@shared/constants";

const MeetHostSection: React.FC<MeetHostSectionProps> = ({
  host,
  onContactHost,
}) => {
  const { theme, isDark } = useTheme();

  if (!host) {
    return null;
  }
  const hostName = `${host.firstName} ${host.lastName}`.trim();
  const yearsHosting =
    new Date().getFullYear() - new Date(host.joinedDate).getFullYear();
  const hostType = host.hostType || "individual";
  const totalReviews = host.totalReviewCount || host.reviewCount || 0;
  const averageRating = host.averageRating || 0;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
          },
        ]}
      >
        Meet your host
      </Text>

      <View
        style={[
          styles.hostCard,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        <View style={styles.hostHeader}>
          <View style={styles.hostImageContainer}>
            {host.avatarUrl || host.profileImage ? (
              <Image
                source={{ uri: host.avatarUrl || host.profileImage }}
                style={styles.hostImage}
              />
            ) : (
              <View
                style={[
                  styles.hostImage,
                  styles.placeholderImage,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.placeholderText,
                    {
                      color: isDark
                        ? theme.colors.gray[300]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {hostName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.hostTypeBadge,
                {
                  backgroundColor:
                    hostType === "organization"
                      ? theme.colors.primary
                      : theme.colors.success,
                },
              ]}
            >
              <Ionicons
                name={hostType === "organization" ? "business" : "person"}
                size={12}
                color={theme.colors.white}
              />
            </View>
          </View>

          <View style={styles.hostInfo}>
            <Text
              style={[
                styles.hostName,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {hostName}
            </Text>
            <Text
              style={[
                styles.hostType,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {hostType === "organization"
                ? "Host Organization"
                : "Individual Host"}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {totalReviews}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Reviews
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: isDark
                      ? theme.colors.gray[100]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {averageRating.toFixed(1)}
              </Text>
              <Ionicons name="star" size={16} color={theme.colors.primary} />
            </View>
            <Text
              style={[
                styles.statLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Rating
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {yearsHosting}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Years hosting
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.contactButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={onContactHost}
        >
          <Text
            style={[styles.contactButtonText, { color: theme.colors.white }]}
          >
            Contact Host
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  hostCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  hostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  hostImageContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  hostImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: "600",
  },
  hostTypeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  hostType: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  contactButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export { MeetHostSection };
