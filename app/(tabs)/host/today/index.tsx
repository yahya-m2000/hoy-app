import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Screen, Text, Button } from "@shared/components";
import { SetupModal } from "@features/host/modals";
import { spacing } from "@core/design";
import { useHostSetup } from "@features/host/hooks";
import {
  ReservationsSection,
  EarningsModal,
  InsightsModal,
  MetricGrid,
} from "@features/host/components/today";
import type { MetricItem } from "@features/host/components/today/MetricGrid";
import { useDashboardData } from "src/features/host/hooks/useDashboardData";
import { useCurrentHostInsights } from "src/features/host/hooks/useHostInsights";
// import {
//   useDashboardData,
//   useCurrentHostInsights,
// } from "@features/host/components/today/hooks";

// Import the Reservation type from the hook
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

export default function HostTodayScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { setupStatus, loading: setupLoading } = useHostSetup();
  const {
    dashboardData,
    todaysActivity,
    earningsData,
    recentReservations,
    loading,
    error,
    refreshData,
  } = useDashboardData();
  const { data: insightsData } = useCurrentHostInsights();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showHostSetup, setShowHostSetup] = useState(false);

  // Debug logging
  console.log("📊 Dashboard State:", {
    dashboardData,
    todaysActivity,
    earningsData,
    recentReservations: recentReservations?.length,
    loading,
    error,
    setupStatus: setupStatus?.isSetupComplete,
    setupLoading,
  });
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Prepare metric data for the grid
  const metricItems: MetricItem[] = [
    {
      icon: "trending-up",
      label: "Earnings",
      value: `$${earningsData?.thisMonth?.toLocaleString() || "0"}`,
      onPress: () => setShowEarningsModal(true),
    },
    {
      icon: "star",
      label: "Insights",
      value: insightsData?.averageRating?.toFixed(1) || "0.0",
      onPress: () => setShowInsightsModal(true),
    },
  ];

  // Show loading screen while checking setup status
  if (setupLoading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="body"
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {t("host.common.loading")}
          </Text>
        </View>
      </Screen>
    );
  }

  // Show setup required screen if not setup complete
  if (!setupStatus?.isSetupComplete) {
    return (
      <Screen style={styles.container}>
        <View style={styles.setupRequiredContainer}>
          <View style={styles.setupContent}>
            <Text variant="h1" style={styles.welcomeTitle}>
              {t("host.setup.welcome")}
            </Text>
            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.welcomeSubtitle}
            >
              {t("host.setup.welcomeSubtitle")}
            </Text>

            <View style={styles.setupFeatures}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📅</Text>
                <Text variant="h4" style={styles.featureTitle}>
                  {t("host.policies.cancellation.title")}
                </Text>
                <Text variant="body" color={theme.text.secondary}>
                  {t("host.policies.cancellation.subtitle")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.setupActions}>
            <Button
              title={t("host.setup.getStarted")}
              onPress={() => setShowHostSetup(true)}
              style={styles.setupButton}
            />
          </View>
        </View>
      </Screen>
    );
  }

  // Show host dashboard if setup is complete
  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View
          style={[
            styles.dashboardContainer,
            // { backgroundColor: theme.background },
          ]}
        >
          {/* Your reservations section */}
          <ReservationsSection
            reservations={recentReservations || []}
            onReservationPress={(reservation: Reservation) => {
              // Navigate to booking details using shared screen
              router.push(`/(tabs)/host/today/${reservation.id}`);
            }}
            onViewAllPress={() => {
              // Navigate to all reservations
              router.push("/(tabs)/host/today/all-reservations");
            }}
          />
          {/* Earnings | Insights Grid using MetricGrid */}
          <MetricGrid title="Overview" items={metricItems} columns={2} />
        </View>
      </ScrollView>
      {/* Modals */}
      <EarningsModal
        visible={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        earningsData={earningsData || undefined}
      />
      <InsightsModal
        visible={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
      />
      <SetupModal
        visible={showHostSetup}
        onClose={() => setShowHostSetup(false)}
        onSetupComplete={() => {
          setShowHostSetup(false);
          refreshData(); // Refresh data after setup completion
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    textAlign: "center",
  },
  setupRequiredContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  setupContent: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  setupFeatures: {
    gap: spacing.lg,
  },
  feature: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  setupActions: {
    alignItems: "center",
    gap: spacing.sm,
  },
  setupButton: {
    width: "100%",
  },
  dashboardContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xl,
  },
  headerSection: {
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
});
