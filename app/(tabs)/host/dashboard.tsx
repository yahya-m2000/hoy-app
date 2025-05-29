/**
 * Host Dashboard Screen
 * Main screen for host mode that displays property overviews, reservations, and earnings
 * Provides a comprehensive view of hosting business performance and upcoming activities
 */

// React Native core
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";

// Expo and third-party libraries
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// App context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useUserRole } from "@common/context/UserRoleContext";
import { useCurrentUser } from "@common/hooks/useUser";
import { useHostDashboard } from "@host/hooks/useHostDashboard";

// Components
import HostHeader from "@host/components/HostHeader";
import EarningsSummary from "@host/components/EarningsSummary";
import PropertySummary from "@host/components/PropertySummary";
import ReservationsList from "@host/components/ReservationsList";
import QuickActions from "@common/components/QuickActions";

// Constants
import { spacing } from "@common/constants/spacing";

/**
 * Main Dashboard screen component
 * Acts as container for all dashboard sections
 */
const DashboardScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost } = useUserRole();
  const currentUser = useCurrentUser();
  const user = currentUser.data;
  const [refreshing, setRefreshing] = useState(false);

  // Use custom hook for dashboard data and operations
  const { dashboardData, isLoading, refetch, upcomingReservations } =
    useHostDashboard();

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

  if (!isHost) return null;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Host Welcome Header */}
      <HostHeader user={user} />
      {/* Earnings Summary */}
      <EarningsSummary isLoading={isLoading} data={dashboardData} />
      {/* Property Summary */}
      <PropertySummary isLoading={isLoading} data={dashboardData} />
      {/* Reservations Summary */}
      <ReservationsList
        isLoading={isLoading}
        reservations={upcomingReservations}
      />{" "}
      {/* Quick Actions */}
      <QuickActions
        actions={[
          {
            id: "add-property",
            title: t("dashboard.addProperty"),
            icon: "add-circle-outline",
            route: "/host/add-property",
          },
          {
            id: "view-reservations",
            title: t("dashboard.viewReservations"),
            icon: "calendar-outline",
            route: "/host/reservations",
          },
        ]}
      />
      {/* Bottom padding */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
});

export default DashboardScreen;
