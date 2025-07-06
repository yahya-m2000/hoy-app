import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme, useCurrencyConversion } from "@core/hooks";
import { useCurrency } from "@core/context";
import {
  Screen,
  Text,
  Button,
  Container,
  Header,
  LoadingSpinner,
} from "@shared/components";
import { SetupModal } from "@features/host/modals";
import { spacing } from "@core/design";
import {
  useHostSetup,
  useHostDashboard,
  useBookingActions,
} from "@features/host/hooks";
import {
  ReservationsSection,
  EarningsModal,
  InsightsModal,
  MetricGrid,
} from "@features/host/components/today";
import type { MetricItem } from "@features/host/components/today/MetricGrid";
import { useCurrentHostInsights } from "@features/host/hooks/useHostInsights";

export default function HostTodayScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { currency, supportedCurrencies } = useCurrency();
  const { convertAmount } = useCurrencyConversion();
  const { setupStatus, loading: setupLoading } = useHostSetup();
  const { handleReservationPress, handleViewAllReservations } =
    useBookingActions();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useHostDashboard();

  const { data: insightsData } = useCurrentHostInsights();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showHostSetup, setShowHostSetup] = useState(false);
  const [convertedEarnings, setConvertedEarnings] = useState<number | null>(
    null
  );

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currencyInfo = supportedCurrencies.find(
      (curr) => curr.code === currency
    );
    return currencyInfo?.symbol || currency;
  };

  // Convert earnings when currency or data changes
  useEffect(() => {
    const convertEarnings = async () => {
      if (dashboardData?.stats.totalEarnings) {
        const converted = await convertAmount(
          dashboardData.stats.totalEarnings,
          "USD"
        );
        setConvertedEarnings(converted);
      }
    };

    convertEarnings();
  }, [dashboardData?.stats.totalEarnings, currency, convertAmount]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchDashboard();
    setIsRefreshing(false);
  };

  const metricItems: MetricItem[] = [
    {
      icon: "trending-up",
      label: t("host.dashboard.metrics.earnings"),
      value: `${getCurrencySymbol()}${
        convertedEarnings?.toLocaleString() ||
        dashboardData?.stats.totalEarnings?.toLocaleString() ||
        t("common.zero")
      }`,
      onPress: () => setShowEarningsModal(true),
    },
    {
      icon: "star",
      label: t("host.dashboard.metrics.insights"),
      value: insightsData?.averageRating?.toFixed(1) || t("common.zeroDecimal"),
      onPress: () => setShowInsightsModal(true),
    },
  ];

  if (setupLoading) {
    return (
      <Screen backgroundColor="background">
        <Header title={t("host.dashboard.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Text
            variant="body2"
            color="secondary"
            style={{ marginTop: spacing.md }}
          >
            {t("host.common.loading")}
          </Text>
        </Container>
      </Screen>
    );
  }

  if (!setupStatus?.isSetupComplete) {
    return (
      <Screen backgroundColor="background">
        <Header title={t("host.setup.title")} />
        <Container flex={1} justifyContent="space-between" padding="lg">
          <Container flex={1} justifyContent="center">
            <Text
              variant="h1"
              align="center"
              style={{ marginBottom: spacing.sm }}
            >
              {t("host.setup.welcome")}
            </Text>
            <Text
              variant="body2"
              color="secondary"
              align="center"
              style={{ marginBottom: spacing.xl }}
            >
              {t("host.setup.welcomeSubtitle")}
            </Text>

            <Container style={{ gap: spacing.lg }}>
              <Container alignItems="center" paddingHorizontal="md">
                <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>
                  {t("host.setup.calendarIcon")}
                </Text>
                <Text
                  variant="h4"
                  align="center"
                  style={{ marginBottom: spacing.xs }}
                >
                  {t("host.policies.cancellation.title")}
                </Text>
                <Text variant="body2" color="secondary" align="center">
                  {t("host.policies.cancellation.subtitle")}
                </Text>
              </Container>
            </Container>
          </Container>

          <Container alignItems="center" style={{ gap: spacing.sm }}>
            <Button
              title={t("host.setup.getStarted")}
              onPress={() => setShowHostSetup(true)}
              style={{ width: "100%" }}
            />
          </Container>
        </Container>
      </Screen>
    );
  }

  return (
    <Screen header={{ title: t("host.dashboard.title"), showDivider: false }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Container
          padding="lg"
          style={{ gap: spacing.xl }}
          backgroundColor="background"
        >
          <ReservationsSection
            reservations={dashboardData?.recentReservations || []}
            onReservationPress={handleReservationPress}
            onViewAllPress={handleViewAllReservations}
          />
          <MetricGrid
            title={t("host.dashboard.overview")}
            items={metricItems}
            columns={2}
          />
        </Container>
      </ScrollView>

      <EarningsModal
        visible={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        earningsData={
          dashboardData?.earnings || {
            thisMonth: 0,
            lastMonth: 0,
            thisYear: 0,
            chartData: [],
          }
        }
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
          handleRefresh();
        }}
      />
    </Screen>
  );
}
