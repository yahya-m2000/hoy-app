import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import {
  Screen,
  Text,
  Container,
  Header,
  LoadingSpinner,
  EmptyState,
} from "@shared/components";
import { spacing } from "@core/design";
import { useHostBookings } from "@features/host/hooks/useHostBookings";
import { useBookingActions } from "@features/host/hooks";
import ReservationList from "@features/host/components/today/ReservationList";
import ReservationsSection, {
  FilterType,
  ReservationFilterSection,
} from "@features/host/components/today/ReservationsSection";
import { Reservation } from "@features/host/components/today/ReservationCard";
import { transformBookingToReservation } from "@features/host/utils";

export default function AllReservationsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { handleReservationPress, handleBackNavigation } = useBookingActions();

  // Fetch real host bookings with filters
  const {
    bookings: hostBookings,
    isLoading,
    error,
    refetch,
  } = useHostBookings({
    status: activeFilter === "all" ? undefined : activeFilter,
    limit: 50, // Fetch more reservations for the all view
  });

  // Transform bookings to reservations format
  const reservations: Reservation[] = React.useMemo(() => {
    if (!hostBookings) return [];
    return hostBookings.map(transformBookingToReservation);
  }, [hostBookings]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // The useHostBookings hook will automatically refetch with new filters
  };

  if (isLoading) {
    return (
      <Screen backgroundColor="background">
        <Header title={t("host.reservations.allReservations")} />
        {/* Filter Tabs - Show even when loading */}
        <ReservationFilterSection
          reservations={[]}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          noPaddingHorizontal={true}
        />
        <Container
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="lg"
        >
          <LoadingSpinner size="large" />
          <Text
            variant="body2"
            color="secondary"
            style={{ marginTop: spacing.md }}
          >
            {t("host.reservations.loading")}
          </Text>
        </Container>
      </Screen>
    );
  }

  // Early return with empty state if no reservations
  if (!reservations || reservations.length === 0) {
    return (
      <Screen
        header={{
          title: t("host.reservations.allReservations"),
          showDivider: false,
          left: {
            icon: "chevron-back-outline",
            onPress: handleBackNavigation,
          },
        }}
      >
        {/* Filter Tabs - Show even when empty */}
        <ReservationFilterSection
          reservations={[]}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          noPaddingHorizontal={true}
        />

        <ReservationList
          reservations={[]}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={{
        title: t("host.reservations.allReservations"),
        showDivider: false,
        left: {
          icon: "chevron-back-outline",
          onPress: handleBackNavigation,
        },
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Container paddingHorizontal="lg">
          {/* Filter Tabs */}
          <ReservationFilterSection
            reservations={reservations}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            noPaddingHorizontal={true}
          />
          {/* Reservations List */}
          <ReservationList
            reservations={reservations}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onReservationPress={handleReservationPress}
          />
        </Container>
      </ScrollView>
    </Screen>
  );
}
