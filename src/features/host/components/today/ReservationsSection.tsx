import React, { useState } from "react";
import {
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { spacing, radius } from "@core/design";
import { Container, Text } from "@shared/components";

// --- FilterTabs ---
type FilterType =
  | "all"
  | "checkingOut"
  | "currentlyHosting"
  | "arrivingSoon"
  | "upcoming"
  | "pendingReview"
  | "pending"
  | "cancelled";

interface FilterTab {
  key: FilterType;
  label: string;
  count: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  noPaddingHorizontal?: boolean;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeFilter,
  onFilterChange,
  noPaddingHorizontal = false,
}) => {
  const { theme } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ maxHeight: 50, marginBottom: spacing.md }}
      contentContainerStyle={{
        paddingHorizontal: noPaddingHorizontal ? 0 : spacing.xs,
        alignItems: "center",
        paddingLeft: noPaddingHorizontal ? 0 : spacing.lg,
        paddingRight: noPaddingHorizontal ? 0 : spacing.lg,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            marginRight: spacing.xs,
            borderWidth: 1,
            borderRadius: 20,
            borderColor:
              activeFilter === tab.key ? theme.colors.primary : theme.border,
            backgroundColor:
              activeFilter === tab.key ? theme.colors.primary : theme.surface,
            minWidth: 48,
            minHeight: 32,
          }}
          onPress={() => onFilterChange(tab.key)}
          accessibilityRole="button"
          accessibilityState={{ selected: activeFilter === tab.key }}
        >
          <Text
            variant="body2"
            weight={activeFilter === tab.key ? "bold" : "medium"}
            color={activeFilter === tab.key ? "#FFFFFF" : "primary"}
            style={{ marginRight: tab.count > 0 ? spacing.xs : 0 }}
          >
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <Text
              variant="caption"
              color={activeFilter === tab.key ? "#FFFFFF" : "secondary"}
            >
              {tab.count}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// --- ReservationFilterSection ---
interface Reservation {
  id: string;
  guestName: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "active" | "completed" | "pending" | "cancelled";
  totalAmount: number;
  nights: number;
}

interface ReservationFilterSectionProps {
  reservations: Reservation[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  noPaddingHorizontal?: boolean;
  showFilterTabs?: boolean;
}

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
    if (reservation.status === "cancelled") {
      categories.cancelled.push(reservation);
      return;
    }
    if (reservation.status === "pending") {
      categories.pending.push(reservation);
      return;
    }
    if (reservation.status === "active") {
      if (checkOut >= todayStart && checkOut < tomorrowStart) {
        categories.checkingOut.push(reservation);
      } else if (checkIn < now && checkOut > now) {
        categories.currentlyHosting.push(reservation);
      } else if (
        checkIn >= todayStart &&
        checkIn < new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)
      ) {
        categories.arrivingSoon.push(reservation);
      }
    } else if (reservation.status === "upcoming") {
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
  showFilterTabs = true,
}) => {
  const { t } = useTranslation();
  const categorizedReservations = categorizeReservations(reservations);
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
  if (!showFilterTabs) return null;
  return (
    <Container
      marginBottom="sm"
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FilterTabs
        tabs={[
          {
            key: "all",
            label: t("features.host.dashboard.reservations.filters.all"),
            count: tabCounts.all,
          },
          {
            key: "pending",
            label: t("features.host.dashboard.reservations.filters.pending"),
            count: tabCounts.pending,
          },
          {
            key: "checkingOut",
            label: t(
              "features.host.dashboard.reservations.filters.checkingOut"
            ),
            count: tabCounts.checkingOut,
          },
          {
            key: "currentlyHosting",
            label: t(
              "features.host.dashboard.reservations.filters.currentlyHosting"
            ),
            count: tabCounts.currentlyHosting,
          },
          {
            key: "arrivingSoon",
            label: t(
              "features.host.dashboard.reservations.filters.arrivingSoon"
            ),
            count: tabCounts.arrivingSoon,
          },
          {
            key: "upcoming",
            label: t("features.host.dashboard.reservations.filters.upcoming"),
            count: tabCounts.upcoming,
          },
          {
            key: "pendingReview",
            label: t(
              "features.host.dashboard.reservations.filters.pendingReview"
            ),
            count: tabCounts.pendingReview,
          },
          {
            key: "cancelled",
            label: t("features.host.dashboard.reservations.filters.cancelled"),
            count: tabCounts.cancelled,
          },
        ]}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
    </Container>
  );
};

// --- ReservationsSection ---
interface ReservationsSectionProps {
  reservations: Reservation[];
  onReservationPress?: (reservation: Reservation) => void;
  onViewAllPress?: () => void;
  showFilterTabs?: boolean;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const cardMargin = spacing.md;
const containerPadding = spacing.md * 2;
const cardWidth = (screenWidth - containerPadding - cardMargin) / 2;

const ReservationsSection: React.FC<ReservationsSectionProps> = ({
  reservations,
  onReservationPress,
  onViewAllPress,
  showFilterTabs = true,
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const renderSectionHeader = () => (
    <Container
      borderRadius="lg"
      paddingHorizontal="lg"
      marginBottom="sm"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Container>
        <Text variant="h6" weight="bold" color={theme.text.primary}>
          {t("features.host.dashboard.reservations.title")}
        </Text>
        <Text variant="caption" color="secondary" weight="medium">
          {reservations.length}{" "}
          {reservations.length === 1
            ? t("features.booking.management.one")
            : t("features.booking.management.many")}
        </Text>
      </Container>
      {reservations.length > 3 && onViewAllPress && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text variant="body2" color="primary" weight="medium">
            {t("common.viewAll")}
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
  const renderReservationGrid = (filteredReservations: Reservation[]) => (
    <FlatList
      data={filteredReservations.slice(0, 4)}
      renderItem={({ item }) => (
        <Container
          style={{
            width: cardWidth,
            marginRight: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          {/* ReservationCard should be updated to support property image, etc. */}
          {/* You can import and use your ReservationCard here if needed */}
          <Text>{item.guestName}</Text>
        </Container>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{
        paddingBottom: spacing.md,
      }}
      ListEmptyComponent={null}
    />
  );
  const filteredReservations = reservations;
  return (
    <Container>
      {renderSectionHeader()}
      {reservations.length > 0 && showFilterTabs && (
        <ReservationFilterSection
          reservations={reservations}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      )}
    </Container>
  );
};

export default ReservationsSection;
export type { FilterType };
export { ReservationFilterSection };
