/**
 * Host Reservations Screen
 * Shows bookings for all host properties with filtering and search
 * Includes reservation status management, guest communication, and check-in/out tracking
 */

// React Native core
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";

// Expo and third-party libraries
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// App context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useUserRole } from "@common/context/UserRoleContext";
import { useCurrency } from "@common/hooks/useCurrency";

// Components
import EmptyState from "@common/components/EmptyState";
import Avatar from "@common/components/Avatar";

// Services
import {
  fetchHostReservations,
  HostReservationResponse,
} from "@host/services/hostService";

// Types
import type { Reservation } from "@common/types/reservation";

// Constants
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";

const ReservationsScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost } = useUserRole();
  const { getSymbol } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, pending, completed, cancelled
  const [refreshing, setRefreshing] = useState(false); // Query for host reservations
  const {
    data: reservations = [],
    isLoading,
    refetch,
  } = useQuery<HostReservationResponse[], Error, Reservation[]>({
    queryKey: ["hostReservations"],
    queryFn: () => fetchHostReservations(),
    select: (data: HostReservationResponse[]) =>
      data.map((reservation) => ({
        ...reservation,
        hostId: "", // Add missing hostId field - will be populated by host context
        guestCount: reservation.guests, // Map guests to guestCount
        currency: "USD", // Add default currency - should come from host settings
        paymentStatus: reservation.isPaid ? "paid" : ("pending" as const), // Map isPaid to paymentStatus
        createdAt: new Date().toISOString(), // Add missing createdAt
        updatedAt: new Date().toISOString(), // Add missing updatedAt
        guests: reservation.guests, // Keep backward compatibility
      })) as Reservation[],
  });

  // Filter reservations based on search and filter
  const filteredReservations = React.useMemo(() => {
    if (!reservations) return [];

    return reservations.filter((reservation) => {
      // Search filter
      const matchesSearch =
        reservation.guestName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        reservation.propertyTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        reservation.propertyLocation
          .toLowerCase()
          .includes(searchQuery.toLowerCase()); // Status filter
      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && reservation.status === "confirmed") ||
        (filter === "pending" && reservation.status === "pending") ||
        (filter === "completed" && reservation.status === "completed") ||
        (filter === "cancelled" && reservation.status === "cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [reservations, searchQuery, filter]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Redirect to traveler mode if not a host
  React.useEffect(() => {
    if (!isHost) {
      router.replace("/(tabs)");
    }
  }, [isHost]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate number of days between two dates
  const calculateDays = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get badge color and text for reservation status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          color: theme.colors.info[500],
          bgColor: isDark ? theme.colors.info[900] : theme.colors.info[100],
          text: t("host.upcoming"),
        };
      case "pending":
        return {
          color: theme.colors.warning[500],
          bgColor: isDark
            ? theme.colors.warning[900]
            : theme.colors.warning[100],
          text: t("host.pending"),
        };
      case "completed":
        return {
          color: theme.colors.success[500],
          bgColor: isDark
            ? theme.colors.success[900]
            : theme.colors.success[100],
          text: t("host.completed"),
        };
      case "cancelled":
        return {
          color: theme.colors.error[500],
          bgColor: isDark ? theme.colors.error[900] : theme.colors.error[100],
          text: t("host.cancelled"),
        };
      default:
        return {
          color: theme.colors.grayPalette[500],
          bgColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.grayPalette[200],
          text: status,
        };
    }
  };

  // Render item for FlatList
  const renderItem = ({ item }: { item: Reservation }) => {
    const statusBadge = getStatusBadge(item.status);
    const nights = calculateDays(item.checkIn, item.checkOut);

    return (
      <TouchableOpacity
        style={[
          styles.reservationCard,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.white,
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
        onPress={() => router.push(`/host/reservation/${item.id}`)}
      >
        <View style={styles.reservationHeader}>
          <View style={styles.guestInfo}>
            <Avatar size="sm" source={item.guestPhoto} name={item.guestName} />
            <View style={styles.guestDetails}>
              <Text
                style={[
                  styles.guestName,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
                numberOfLines={1}
              >
                {item.guestName}
              </Text>
              <Text
                style={[
                  styles.guestCount,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {item.guests}{" "}
                {item.guests === 1 ? t("common.guest") : t("common.guests")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusBadge.bgColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        <View style={styles.propertyDetails}>
          <Text
            style={[
              styles.propertyTitle,
              {
                color: isDark
                  ? theme.colors.white
                  : theme.colors.grayPalette[900],
              },
            ]}
            numberOfLines={1}
          >
            {item.propertyTitle}
          </Text>
          <Text
            style={[
              styles.propertyLocation,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
            numberOfLines={1}
          >
            {item.propertyLocation}
          </Text>
        </View>

        <View
          style={[
            styles.reservationDivider,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[200],
            },
          ]}
        />

        <View style={styles.reservationFooter}>
          <View style={styles.dateRange}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.dateText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
            </Text>
            <Text
              style={[
                styles.nightsText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {nights} {nights === 1 ? t("common.night") : t("common.nights")}
            </Text>
          </View>

          <View style={styles.paymentInfo}>
            <Text
              style={[
                styles.totalAmount,
                {
                  color: isDark
                    ? theme.colors.white
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {getSymbol()}
              {item.totalAmount.toLocaleString()}
            </Text>
            {item.isPaid ? (
              <View style={styles.paidStatus}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={theme.colors.success[500]}
                  style={{ marginRight: 2 }}
                />
                <Text
                  style={[
                    styles.paidText,
                    { color: theme.colors.success[500] },
                  ]}
                >
                  {t("host.paid")}
                </Text>
              </View>
            ) : (
              <View style={styles.paidStatus}>
                <Ionicons
                  name="time"
                  size={14}
                  color={theme.colors.warning[500]}
                  style={{ marginRight: 2 }}
                />
                <Text
                  style={[
                    styles.paidText,
                    { color: theme.colors.warning[500] },
                  ]}
                >
                  {t("host.unpaid")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isHost) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
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
        <Ionicons
          name="search"
          size={20}
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[500]
          }
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: isDark
                ? theme.colors.white
                : theme.colors.grayPalette[900],
            },
          ]}
          placeholder={t("host.searchReservations")}
          placeholderTextColor={
            isDark
              ? theme.colors.grayPalette[500]
              : theme.colors.grayPalette[400]
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[500]
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "all"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "all" ? "600" : "400",
              },
            ]}
          >
            {t("host.allReservations")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "upcoming" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("upcoming")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "upcoming"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "upcoming" ? "600" : "400",
              },
            ]}
          >
            {t("host.upcoming")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "pending" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "pending"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "pending" ? "600" : "400",
              },
            ]}
          >
            {t("host.pending")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "completed" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "completed"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "completed" ? "600" : "400",
              },
            ]}
          >
            {t("host.completed")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "cancelled" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("cancelled")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "cancelled"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "cancelled" ? "600" : "400",
              },
            ]}
          >
            {t("host.cancelled")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text
          style={[
            styles.resultsCount,
            {
              color: isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          {filteredReservations.length}{" "}
          {filteredReservations.length === 1
            ? t("host.reservation")
            : t("host.reservations")}
        </Text>
      </View>

      {/* Reservations list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : filteredReservations.length > 0 ? (
        <FlatList
          data={filteredReservations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={
            searchQuery.length > 0
              ? t("host.noReservationsFound")
              : t("host.noReservations")
          }
          message={
            searchQuery.length > 0
              ? t("host.noReservationsFoundDesc")
              : t("host.noReservationsDesc")
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  filterScrollView: {
    maxHeight: 40,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
  },
  filterTab: {
    marginRight: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterText: {
    fontSize: fontSize.md,
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  resultsCount: {
    fontSize: fontSize.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  reservationCard: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: "hidden",
    padding: spacing.md,
    borderWidth: 1,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  guestInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  guestDetails: {
    marginLeft: spacing.sm,
  },
  guestName: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  guestCount: {
    fontSize: fontSize.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  propertyDetails: {
    marginBottom: spacing.sm,
  },
  propertyTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
  },
  reservationDivider: {
    height: 1,
    width: "100%",
    marginVertical: spacing.sm,
  },
  reservationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  nightsText: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  paymentInfo: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  paidStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  paidText: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
});

export default ReservationsScreen;
