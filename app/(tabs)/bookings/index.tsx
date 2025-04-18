/**
 * Bookings screen for the Hoy application
 * Shows past and upcoming reservations
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import spacing from "../../../src/constants/spacing";
import radius from "../../../src/constants/radius";
import { mockBookings } from "../../../src/utils/mockData";
import { BookingType } from "../../../src/types/property";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";
import { format } from "date-fns";

type BookingTab = "upcoming" | "past" | "cancelled";

export default function BookingsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    // Simulate loading state for demo purposes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case "upcoming":
        return mockBookings
          .filter(
            (booking) =>
              booking.status === "confirmed" || booking.status === "pending"
          )
          .map((booking) => ({
            ...booking,
            status: booking.status as BookingType["status"],
          }));
      case "past":
        return mockBookings
          .filter((booking) => booking.status === "completed")
          .map((booking) => ({
            ...booking,
            status: booking.status as BookingType["status"],
          }));
      case "cancelled":
        return mockBookings
          .filter((booking) => booking.status === "cancelled")
          .map((booking) => ({
            ...booking,
            status: booking.status as BookingType["status"],
          }));
      default:
        return mockBookings.map((booking) => ({
          ...booking,
          status: booking.status as BookingType["status"],
        }));
    }
  };

  const filteredBookings = getFilteredBookings();

  const renderTabButton = (tab: BookingTab, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && {
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary[500],
        },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color:
              activeTab === tab
                ? isDark
                  ? theme.colors.primary[400]
                  : theme.colors.primary[600]
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[600],
            fontWeight: activeTab === tab ? "600" : "400",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderBookingStatus = (status: string) => {
    let color;
    let label;

    switch (status) {
      case "confirmed":
        color = theme.colors.success[500];
        label = t("bookings.statusConfirmed");
        break;
      case "pending":
        color = theme.colors.warning[500];
        label = t("bookings.statusPending");
        break;
      case "cancelled":
        color = theme.colors.error[500];
        label = t("bookings.statusCancelled");
        break;
      case "completed":
        color = theme.colors.gray[500];
        label = t("bookings.statusCompleted");
        break;
      default:
        color = theme.colors.info[500];
        label = status;
    }

    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isDark ? "transparent" : `${color}20` },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text
          style={[styles.statusText, { color: isDark ? color : `${color}` }]}
        >
          {label}
        </Text>
      </View>
    );
  };

  const renderBookingItem = ({ item }: { item: BookingType }) => {
    // Format dates
    const startDate = format(new Date(item.startDate), "MMM d, yyyy");
    const endDate = format(new Date(item.endDate), "MMM d, yyyy");

    return (
      <TouchableOpacity
        style={[
          styles.bookingCard,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[50],
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
        onPress={() => {
          console.log(`Navigate to booking details ${item.id}`);
        }}
      >
        {item.property && (
          <View style={styles.bookingContent}>
            <Image
              source={{ uri: item.property.images[0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
            <View style={styles.bookingDetails}>
              <Text
                style={[
                  styles.propertyTitle,
                  {
                    color: isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900],
                  },
                ]}
                numberOfLines={1}
              >
                {item.property.title}
              </Text>
              <Text
                style={[
                  styles.propertyLocation,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
                numberOfLines={1}
              >
                {item.property.location}
              </Text>
              <Text
                style={[
                  styles.bookingDates,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {startDate} - {endDate}
              </Text>
              <View style={styles.bookingFooter}>
                {renderBookingStatus(item.status)}
                <Text
                  style={[
                    styles.bookingPrice,
                    {
                      color: isDark
                        ? theme.colors.gray[50]
                        : theme.colors.gray[900],
                    },
                  ]}
                >
                  ${item.totalPrice}
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
        ]}
      >
        {t("bookings.noBookings")}
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? theme.colors.gray[400] : theme.colors.gray[500] },
        ]}
      >
        {t("bookings.noBookingsDescription")}
      </Text>
    </View>
  );

  const renderBookingLoadingSkeleton = () => (
    <View
      style={[
        styles.bookingCard,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[50],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
    >
      <View style={styles.bookingContent}>
        <LoadingSkeleton width={80} height={80} borderRadius={8} />
        <View style={styles.bookingDetails}>
          <LoadingSkeleton width={200} height={18} borderRadius={4} />
          <LoadingSkeleton
            width={150}
            height={16}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
          <LoadingSkeleton
            width={120}
            height={16}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
          <View style={[styles.bookingFooter, { marginTop: 8 }]}>
            <LoadingSkeleton width={80} height={20} borderRadius={12} />
            <LoadingSkeleton width={60} height={18} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Tab Navigation */}
      <View
        style={[
          styles.tabContainer,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        {renderTabButton("upcoming", t("bookings.upcoming"))}
        {renderTabButton("past", t("bookings.past"))}
        {renderTabButton("cancelled", t("bookings.cancelled"))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderBookingLoadingSkeleton()}
          {renderBookingLoadingSkeleton()}
          {renderBookingLoadingSkeleton()}
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  tabButtonText: {
    fontSize: fontSize.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  bookingCard: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  bookingContent: {
    flexDirection: "row",
    padding: spacing.sm,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
  },
  bookingDetails: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: "center",
  },
  propertyTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  propertyLocation: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  bookingDates: {
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.circle,
    marginRight: spacing.xxs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  bookingPrice: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginVertical: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
