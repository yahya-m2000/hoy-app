import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { spacing } from "@core/design";
import FilterTabs, { FilterType } from "./FilterTabs";
import { Reservation } from "./ReservationCard";

interface ReservationFilterSectionProps {
  reservations: Reservation[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  noPaddingHorizontal?: boolean;
  showFilterTabs?: boolean; // Allow hiding filter tabs if needed
}

// Helper function to categorize reservations by status
const categorizeReservations = (reservations: Reservation[]) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const categories = {
    checkingOut: [] as Reservation[],
    currentlyHosting: [] as Reservation[],
    arrivingSoon: [] as Reservation[],
    upcoming: [] as Reservation[],
    pendingReview: [] as Reservation[],
    pending: [] as Reservation[],
    cancelled: [] as Reservation[],
  };

  reservations.forEach((reservation) => {
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    // Handle cancelled and pending first
    if (reservation.status === "cancelled") {
      categories.cancelled.push(reservation);
      return;
    }

    if (reservation.status === "pending") {
      categories.pending.push(reservation);
      return;
    }

    if (reservation.status === "active") {
      // Checking out today
      if (checkOut >= todayStart && checkOut < tomorrowStart) {
        categories.checkingOut.push(reservation);
      }
      // Currently hosting (checked in, not yet checked out)
      else if (checkIn < now && checkOut > now) {
        categories.currentlyHosting.push(reservation);
      }
      // Arriving soon (checking in today or tomorrow)
      else if (
        checkIn >= todayStart &&
        checkIn < new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)
      ) {
        categories.arrivingSoon.push(reservation);
      }
    } else if (reservation.status === "upcoming") {
      // Upcoming (future bookings)
      categories.upcoming.push(reservation);
    } else if (reservation.status === "completed") {
      categories.pendingReview.push(reservation);
    }
  });

  return categories;
};

const ReservationFilterSection: React.FC<ReservationFilterSectionProps> = ({
  reservations,
  activeFilter,
  onFilterChange,
  noPaddingHorizontal = false,
  showFilterTabs = true,
}) => {
  const { t } = useTranslation();
  const categorizedReservations = categorizeReservations(reservations);

  // Calculate counts for tabs
  const getTabCounts = () => ({
    all: reservations.length,
    checkingOut: categorizedReservations.checkingOut.length,
    currentlyHosting: categorizedReservations.currentlyHosting.length,
    arrivingSoon: categorizedReservations.arrivingSoon.length,
    upcoming: categorizedReservations.upcoming.length,
    pendingReview: categorizedReservations.pendingReview.length,
    pending: categorizedReservations.pending.length,
    cancelled: categorizedReservations.cancelled.length,
  });

  const tabCounts = getTabCounts();

  if (!showFilterTabs) {
    return null;
  }

  return (
    <View style={styles.filterTabsContainer}>
      <FilterTabs
        tabs={[
          {
            key: "all",
            label: t("host.today.filters.all"),
            count: tabCounts.all,
          },
          {
            key: "pending",
            label: t("host.today.filters.pending"),
            count: tabCounts.pending,
          },
          {
            key: "checkingOut",
            label: t("host.today.filters.checkingOut"),
            count: tabCounts.checkingOut,
          },
          {
            key: "currentlyHosting",
            label: t("host.today.filters.currentlyHosting"),
            count: tabCounts.currentlyHosting,
          },
          {
            key: "arrivingSoon",
            label: t("host.today.filters.arrivingSoon"),
            count: tabCounts.arrivingSoon,
          },
          {
            key: "upcoming",
            label: t("host.today.filters.upcoming"),
            count: tabCounts.upcoming,
          },
          {
            key: "pendingReview",
            label: t("host.today.filters.pendingReview"),
            count: tabCounts.pendingReview,
          },
          {
            key: "cancelled",
            label: t("host.today.filters.cancelled"),
            count: tabCounts.cancelled,
          },
        ]}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        noPaddingHorizontal={noPaddingHorizontal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterTabsContainer: {
    paddingTop: spacing.small,
    marginBottom: spacing.small,
  },
});

export default ReservationFilterSection;
