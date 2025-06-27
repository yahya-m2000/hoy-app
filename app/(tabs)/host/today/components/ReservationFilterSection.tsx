import React from "react";
import { View, StyleSheet } from "react-native";
import { spacing } from "@shared/constants";
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
  };

  reservations.forEach((reservation) => {
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
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
  const categorizedReservations = categorizeReservations(reservations);

  // Calculate counts for tabs
  const getTabCounts = () => ({
    all: reservations.length,
    checkingOut: categorizedReservations.checkingOut.length,
    currentlyHosting: categorizedReservations.currentlyHosting.length,
    arrivingSoon: categorizedReservations.arrivingSoon.length,
    upcoming: categorizedReservations.upcoming.length,
    pendingReview: categorizedReservations.pendingReview.length,
  });

  const tabCounts = getTabCounts();

  if (!showFilterTabs) {
    return null;
  }

  return (
    <View style={styles.filterTabsContainer}>
      <FilterTabs
        tabs={[
          { key: "all", label: "All", count: tabCounts.all },
          {
            key: "checkingOut",
            label: "Checking out",
            count: tabCounts.checkingOut,
          },
          {
            key: "currentlyHosting",
            label: "Currently hosting",
            count: tabCounts.currentlyHosting,
          },
          {
            key: "arrivingSoon",
            label: "Arriving soon",
            count: tabCounts.arrivingSoon,
          },
          { key: "upcoming", label: "Upcoming", count: tabCounts.upcoming },
          {
            key: "pendingReview",
            label: "Pending review",
            count: tabCounts.pendingReview,
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
