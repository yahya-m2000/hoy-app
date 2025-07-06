import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";
import ReservationCard, { Reservation } from "./ReservationCard";
import { FilterType } from "./FilterTabs";

interface ReservationListProps {
  reservations: Reservation[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onReservationPress?: (reservation: Reservation) => void;
  maxDisplayCount?: number; // For limited display (dashboard)
  onViewAllPress?: () => void; // For "View all" button
}

export interface CategorizedReservations {
  checkingOut: Reservation[];
  currentlyHosting: Reservation[];
  arrivingSoon: Reservation[];
  upcoming: Reservation[];
  pendingReview: Reservation[];
  pending: Reservation[];
  cancelled: Reservation[];
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  activeFilter,
  onFilterChange,
  onReservationPress,
  maxDisplayCount,
  onViewAllPress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Categorize reservations based on dates and status
  const categorizeReservations = (
    reservations: Reservation[]
  ): CategorizedReservations => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    const categories: CategorizedReservations = {
      checkingOut: [],
      currentlyHosting: [],
      arrivingSoon: [],
      upcoming: [],
      pendingReview: [],
      pending: [],
      cancelled: [],
    };

    console.log("🔄 Categorizing reservations:", {
      total: reservations.length,
      today: todayString,
    });

    reservations.forEach((reservation) => {
      try {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          console.warn("❌ Invalid dates for reservation:", reservation);
          return;
        }

        const checkInString = checkIn.toISOString().split("T")[0];
        const checkOutString = checkOut.toISOString().split("T")[0];

        console.log("📅 Processing reservation:", {
          id: reservation.id,
          status: reservation.status,
          checkIn: checkInString,
          checkOut: checkOutString,
        });

        // Handle cancelled reservations first
        if (reservation.status === "cancelled") {
          categories.cancelled.push(reservation);
          return;
        }

        // Handle pending reservations
        if (reservation.status === "pending") {
          categories.pending.push(reservation);
          return;
        }

        // Handle active reservations
        if (reservation.status === "active") {
          if (checkOutString === todayString) {
            categories.checkingOut.push(reservation);
          } else {
            categories.currentlyHosting.push(reservation);
          }
          return;
        }

        // Handle upcoming reservations
        if (reservation.status === "upcoming") {
          if (checkInString === todayString) {
            categories.arrivingSoon.push(reservation);
          } else {
            categories.upcoming.push(reservation);
          }
          return;
        }

        // Handle completed reservations
        if (reservation.status === "completed") {
          categories.pendingReview.push(reservation);
        }
      } catch (error) {
        console.error("❌ Error processing reservation:", error, reservation);
      }
    });

    // Log categorization results
    console.log("✅ Categorization results:", {
      checkingOut: categories.checkingOut.length,
      currentlyHosting: categories.currentlyHosting.length,
      arrivingSoon: categories.arrivingSoon.length,
      upcoming: categories.upcoming.length,
      pendingReview: categories.pendingReview.length,
      pending: categories.pending.length,
      cancelled: categories.cancelled.length,
    });

    return categories;
  };

  const categorizedReservations = categorizeReservations(reservations);

  const getFilteredReservations = (): Reservation[] => {
    switch (activeFilter) {
      case "checkingOut":
        return categorizedReservations.checkingOut;
      case "currentlyHosting":
        return categorizedReservations.currentlyHosting;
      case "arrivingSoon":
        return categorizedReservations.arrivingSoon;
      case "upcoming":
        return [
          ...categorizedReservations.arrivingSoon,
          ...categorizedReservations.upcoming,
        ];
      case "pendingReview":
        return categorizedReservations.pendingReview;
      case "pending":
        return categorizedReservations.pending;
      case "cancelled":
        return categorizedReservations.cancelled;
      case "all":
      default:
        return [
          ...categorizedReservations.currentlyHosting,
          ...categorizedReservations.checkingOut,
          ...categorizedReservations.arrivingSoon,
          ...categorizedReservations.upcoming,
          ...categorizedReservations.pending,
          ...categorizedReservations.pendingReview,
        ];
    }
  };

  const filteredReservations = getFilteredReservations();

  const getReservationStatusLabel = (
    reservation: Reservation
  ): string | null => {
    if (categorizedReservations.currentlyHosting.includes(reservation)) {
      return t("host.today.status.currentlyHosting");
    } else if (categorizedReservations.checkingOut.includes(reservation)) {
      return t("host.today.status.checkingOutToday");
    } else if (categorizedReservations.arrivingSoon.includes(reservation)) {
      return t("host.today.status.arrivingToday");
    } else if (categorizedReservations.upcoming.includes(reservation)) {
      return t("host.today.status.upcoming");
    } else if (categorizedReservations.pending.includes(reservation)) {
      return t("host.today.status.pendingConfirmation");
    } else if (categorizedReservations.cancelled.includes(reservation)) {
      return t("host.today.status.cancelled");
    } else if (categorizedReservations.pendingReview.includes(reservation)) {
      return t("host.today.status.pendingReview");
    }
    return null;
  };

  // For limited display, show only maxDisplayCount reservations
  const displayReservations = maxDisplayCount
    ? filteredReservations.slice(0, maxDisplayCount)
    : filteredReservations;

  const hasMoreReservations =
    maxDisplayCount && filteredReservations.length > maxDisplayCount;

  if (reservations.length === 0) {
    return (
      <View>
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={48}
            color={theme.text.secondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            {t("host.today.reservations.noReservations")}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            {t("host.today.reservations.noReservationsSubtitle")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {filteredReservations.length === 0 ? (
        <View style={styles.emptyFilterContainer}>
          <Text
            style={[styles.emptyFilterText, { color: theme.text.secondary }]}
          >
            {t("host.today.reservations.noReservationsInCategory")}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {displayReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              statusLabel={getReservationStatusLabel(reservation)}
              isCurrentlyHosting={categorizedReservations.currentlyHosting.includes(
                reservation
              )}
              onPress={onReservationPress}
            />
          ))}
          {hasMoreReservations && onViewAllPress && (
            <TouchableOpacity
              style={[styles.viewAllButton, { borderColor: theme.border }]}
              onPress={onViewAllPress}
            >
              <Text
                style={[
                  styles.viewAllButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                {t("host.today.reservations.viewAllReservations", {
                  count: filteredReservations.length,
                })}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyFilterContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFilterText: {
    fontSize: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ReservationList;
