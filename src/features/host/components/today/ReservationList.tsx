import React from "react";
import { TouchableOpacity, ScrollView } from "react-native";
import { Container, Text, EmptyState } from "@shared/components";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";
import ReservationCard, { Reservation } from "./ReservationCard";
import { FilterType } from "./ReservationsSection";

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

    reservations.forEach((reservation) => {
      try {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          return;
        }

        const checkInString = checkIn.toISOString().split("T")[0];
        const checkOutString = checkOut.toISOString().split("T")[0];

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
        // Ignore invalid reservation
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
          ...categorizedReservations.cancelled,
        ];
    }
  };

  const filteredReservations = getFilteredReservations();

  const getReservationStatusLabel = (
    reservation: Reservation
  ): string | null => {
    if (categorizedReservations.currentlyHosting.includes(reservation)) {
      return t("features.host.dashboard.status.currentlyHosting");
    } else if (categorizedReservations.checkingOut.includes(reservation)) {
      return t("features.host.dashboard.status.checkingOutToday");
    } else if (categorizedReservations.arrivingSoon.includes(reservation)) {
      return t("features.host.dashboard.status.arrivingToday");
    } else if (categorizedReservations.upcoming.includes(reservation)) {
      return t("features.host.dashboard.status.upcoming");
    } else if (categorizedReservations.pending.includes(reservation)) {
      return t("features.host.dashboard.status.pendingConfirmation");
    } else if (categorizedReservations.cancelled.includes(reservation)) {
      return t("features.host.dashboard.status.cancelled");
    } else if (categorizedReservations.pendingReview.includes(reservation)) {
      return t("features.host.dashboard.status.pendingReview");
    }
    return null;
  };

  // For limited display, show only maxDisplayCount reservations
  const displayReservations = maxDisplayCount
    ? filteredReservations.slice(0, maxDisplayCount)
    : filteredReservations;

  const hasMoreReservations =
    maxDisplayCount && filteredReservations.length > maxDisplayCount;

  if (filteredReservations.length === 0) {
    return (
      <EmptyState
        title={t("features.host.dashboard.reservations.noReservationsInCategory")}
        message={t(
          "features.host.dashboard.reservations.noReservationsInCategoryMessage",
          ""
        )}
        icon="calendar-outline"
      />
    );
  }

  return (
    <Container paddingHorizontal="md">
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
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: spacing.md,
              marginTop: spacing.sm,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
              alignSelf: "center",
            }}
            onPress={onViewAllPress}
          >
            <Text
              variant="body2"
              color="primary"
              weight="medium"
              style={{ marginRight: spacing.xs }}
            >
              {t("features.host.dashboard.reservations.viewAllReservations", {
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
    </Container>
  );
};

export default ReservationList;
