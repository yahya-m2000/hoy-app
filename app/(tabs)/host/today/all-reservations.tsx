import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";
import { useDashboardData } from "@features/host/hooks/useDashboardData";
import { FilterType } from "@features/host/components/today/FilterTabs";
import ReservationList from "@features/host/components/today/ReservationList";
import ReservationFilterSection from "@features/host/components/today/ReservationFilterSection";
import { Reservation } from "@features/host/components/today/ReservationCard";

export default function AllReservationsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { recentReservations, loading } = useDashboardData();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const handleReservationPress = (reservation: Reservation) => {
    // Navigate to booking details using shared screen
    router.push(`/(tabs)/host/today/${reservation.id}`);
  };
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Filter Tabs - Show even when loading */}
        <ReservationFilterSection
          reservations={[]}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          noPaddingHorizontal={true}
        />
        {/* Could add a loading spinner here */}
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading reservations...
          </Text>
        </View>
      </View>
    );
  } // Early return with empty state if no reservations
  if (!recentReservations || recentReservations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Filter Tabs - Show even when empty */}
        <ReservationFilterSection
          reservations={[]}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          noPaddingHorizontal={true}
        />
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No reservations yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            When guests book your place, their reservations will appear here.
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter Tabs */}
      <ReservationFilterSection
        reservations={recentReservations}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        noPaddingHorizontal={true}
      />
      {/* Reservations List */}
      <ReservationList
        reservations={recentReservations}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onReservationPress={handleReservationPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: spacing.medium,
    padding: spacing.large,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.small,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
});
