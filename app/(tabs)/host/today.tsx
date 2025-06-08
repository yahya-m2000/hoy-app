/**
 * Today Tab Screen for Host Mode
 * Displays current reservation activity and overview
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@shared/context";
import { getHostReservations } from "@shared/services/hostService";
import type { Reservation } from "@shared/types/booking/reservation";
import { ReservationCarousel, FilterCarousel } from "@modules/properties/";
import { LoadingSpinner } from "@shared/components";

export type ReservationStatus =
  | "checking_out"
  | "hosting"
  | "arriving"
  | "upcoming"
  | "pending";

const TodayScreen = () => {
  const { theme } = useTheme();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [activeFilter, setActiveFilter] =
    useState<ReservationStatus>("checking_out");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalReservations, setTotalReservations] = useState(0);

  const filterOptions: { key: ReservationStatus; label: string }[] = [
    { key: "checking_out", label: "Checking Out" },
    { key: "hosting", label: "Currently Hosting" },
    { key: "arriving", label: "Arriving Soon" },
    { key: "upcoming", label: "Upcoming" },
    { key: "pending", label: "Pending" },
  ];

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter as ReservationStatus);
  };
  const filterReservationsByStatus = useCallback(() => {
    // Defensive check to ensure reservations is an array
    if (!Array.isArray(reservations)) {
      console.warn("Reservations is not an array:", reservations);
      setFilteredReservations([]);
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    let filtered: Reservation[] = [];

    switch (activeFilter) {
      case "checking_out":
        filtered = reservations.filter(
          (r) => r.checkOut === todayStr && r.status === "confirmed"
        );
        break;
      case "hosting":
        filtered = reservations.filter((r) => {
          const checkIn = new Date(r.checkIn);
          const checkOut = new Date(r.checkOut);
          return (
            checkIn <= today && checkOut > today && r.status === "confirmed"
          );
        });
        break;
      case "arriving":
        filtered = reservations.filter(
          (r) => r.checkIn === todayStr && r.status === "confirmed"
        );
        break;
      case "upcoming":
        filtered = reservations.filter((r) => {
          const checkIn = new Date(r.checkIn);
          return checkIn > today && r.status === "confirmed";
        });
        break;
      case "pending":
        filtered = reservations.filter((r) => r.status === "pending");
        break;
    }

    setFilteredReservations(filtered);
  }, [activeFilter, reservations]);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservationsByStatus();
  }, [filterReservationsByStatus]);
  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading host reservations...");

      const response = await getHostReservations();

      console.log("✅ Raw response from getHostReservations:", response);
      console.log("📊 Response type:", typeof response);
      console.log("📋 Is array:", Array.isArray(response));
      console.log("📈 Response length:", response?.length || "undefined");

      // Ensure we have an array
      const reservationArray = Array.isArray(response) ? response : [];

      setReservations(reservationArray);
      setTotalReservations(reservationArray.length);

      console.log(
        "✅ Reservations set successfully:",
        reservationArray.length,
        "items"
      );
    } catch (error) {
      console.error("❌ Error loading reservations:", error);
      Alert.alert("Error", "Failed to load reservations");

      // Set empty array on error
      setReservations([]);
      setTotalReservations(0);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const handleAllReservations = () => {
    // Navigate to all reservations screen (WIP for now)
    Alert.alert("Coming Soon", "Full reservations list is under development");
  };

  const getWelcomeMessage = () => {
    const firstName = "Host"; // Default since user may not be available
    const hour = new Date().getHours();

    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.text.primary }]}>
            {getWelcomeMessage()}
          </Text>
          <Text style={[styles.subHeaderText, { color: theme.text.secondary }]}>
            Here&apos;s what&apos;s happening today
          </Text>
        </View>

        {/* Your Reservations Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Your Reservations
          </Text>
          {/* Filter Carousel */}
          <FilterCarousel
            options={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          {/* Reservations Carousel */}
          <ReservationCarousel
            reservations={filteredReservations}
            emptyMessage={`No ${filterOptions
              .find((f) => f.key === activeFilter)
              ?.label.toLowerCase()} reservations`}
          />
        </View>

        {/* All Reservations Link */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.allReservationsButton,
              { borderColor: theme.border },
            ]}
            onPress={handleAllReservations}
          >
            <Text
              style={[
                styles.allReservationsText,
                { color: theme.colors.primary },
              ]}
            >
              All Reservations
            </Text>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={[styles.countText, { color: theme.white }]}>
                {totalReservations}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  allReservationsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  allReservationsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TodayScreen;
