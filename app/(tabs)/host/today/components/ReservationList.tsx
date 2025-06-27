import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants";
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
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  activeFilter,
  onFilterChange,
  onReservationPress,
  maxDisplayCount,
  onViewAllPress,
}) => {
  const { theme } = useTheme();

  // Categorize reservations based on dates and status
  const categorizeReservations = (
    reservations: Reservation[]
  ): CategorizedReservations => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const categories: CategorizedReservations = {
      checkingOut: [],
      currentlyHosting: [],
      arrivingSoon: [],
      upcoming: [],
      pendingReview: [],
    };

    reservations.forEach((reservation) => {
      try {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          return;
        }

        const checkInString = checkIn.toISOString().split("T")[0];
        const checkOutString = checkOut.toISOString().split("T")[0];

        if (checkOutString === todayString && reservation.status === "active") {
          categories.checkingOut.push(reservation);
        } else if (
          reservation.status === "active" &&
          checkOutString !== todayString
        ) {
          categories.currentlyHosting.push(reservation);
        } else if (
          reservation.status === "upcoming" &&
          checkInString === todayString
        ) {
          categories.arrivingSoon.push(reservation);
        } else if (reservation.status === "upcoming") {
          categories.upcoming.push(reservation);
        } else if (reservation.status === "completed") {
          categories.pendingReview.push(reservation);
        }
      } catch {
        console.warn("❌ Error processing reservation date:", reservation);
      }
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
        return categorizedReservations.upcoming;
      case "pendingReview":
        return categorizedReservations.pendingReview;
      case "all":
      default:
        return [
          ...categorizedReservations.currentlyHosting,
          ...categorizedReservations.checkingOut,
          ...categorizedReservations.arrivingSoon,
          ...categorizedReservations.upcoming,
          ...categorizedReservations.pendingReview,
        ];
    }
  };
  const filteredReservations = getFilteredReservations();

  const getReservationStatusLabel = (
    reservation: Reservation
  ): string | null => {
    if (categorizedReservations.currentlyHosting.includes(reservation)) {
      return "Currently hosting";
    } else if (categorizedReservations.checkingOut.includes(reservation)) {
      return "Checking out";
    } else if (categorizedReservations.arrivingSoon.includes(reservation)) {
      return "Arriving soon";
    } else if (categorizedReservations.upcoming.includes(reservation)) {
      return "Upcoming";
    } else if (categorizedReservations.pendingReview.includes(reservation)) {
      return "Pending review";
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
            No reservations yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            When guests book your place, you&apos;ll see their reservations here
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
            No reservations in this category
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
                View all {filteredReservations.length} reservations
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
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ReservationList;
