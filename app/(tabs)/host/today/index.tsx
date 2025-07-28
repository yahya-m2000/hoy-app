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
  EmptyState,
} from "@shared/components";
// import SetupScreen from "../setup";
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
  ReservationList,
} from "@features/host/components/today";
import type { FilterType } from "@features/host/components/today/ReservationsSection";
import { SetupPrompt } from "@features/host/components/setup";
import type { MetricItem } from "@features/host/components/today/MetricGrid";
import { useCurrentHostInsights } from "@features/host/hooks/useHostInsights";
import { BETA_CONFIG } from "@core/config/beta";
import { StatusBar } from "expo-status-bar";

export default function HostTodayScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
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
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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
        // No conversion needed if currency is USD
        if (currency === "USD") {
          setConvertedEarnings(dashboardData.stats.totalEarnings);
          return;
        }

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
      label: t("features.host.dashboard.metrics.earnings"),
      value: `${getCurrencySymbol()}${
        convertedEarnings?.toLocaleString() ||
        dashboardData?.stats.totalEarnings?.toLocaleString() ||
        t("common.zero")
      }`,
      onPress: () => setShowEarningsModal(true),
    },
    {
      icon: "star",
      label: t("features.host.dashboard.metrics.insights"),
      value: insightsData?.averageRating?.toFixed(1) || t("common.zeroDecimal"),
      onPress: () => setShowInsightsModal(true),
    },
  ];

  if (setupLoading) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header title={t("features.host.dashboard.main.title")} />
        <StatusBar style={isDark ? "light" : "dark"} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Text
            variant="body2"
            color="secondary"
            style={{ marginTop: spacing.md }}
          >
            {t("features.host.dashboard.main.loading")}
          </Text>
        </Container>
      </Container>
    );
  }

  // Bypass setup required in beta mode
  if (!BETA_CONFIG.isBeta && !setupStatus?.isSetupComplete) {
    return (
      <>
        <Container flex={1} backgroundColor={theme.background}>
          <Header title={t("features.host.dashboard.main.title")} />
          <StatusBar style={isDark ? "light" : "dark"} />
          <SetupPrompt
            onStartSetup={() => setShowHostSetup(true)}
            title={t("features.host.setup.main.todayPromptTitle")}
            message={t("features.host.setup.main.todayPromptMessage")}
            variant="default"
          />
        </Container>
        {/* <SetupScreen
          visible={showHostSetup}
          onClose={() => setShowHostSetup(false)}
          onSetupComplete={() => {
            setShowHostSetup(false);
            handleRefresh();
          }}
        /> */}
      </>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header title={t("features.host.dashboard.main.title")} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <Container backgroundColor="background">
          <ReservationsSection
            reservations={dashboardData?.recentReservations || []}
            onReservationPress={handleReservationPress}
            onViewAllPress={handleViewAllReservations}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          {dashboardData?.recentReservations &&
          dashboardData?.recentReservations.length > 0 ? (
            <ReservationList
              reservations={dashboardData?.recentReservations || []}
              onReservationPress={handleReservationPress}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          ) : (
            <Container
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding="xl"
            >
              <EmptyState
                icon="calendar-outline"
                title={t("features.host.dashboard.reservations.noReservations")}
                message={t(
                  "features.host.dashboard.reservations.noReservationsSubtitle"
                )}
              />
            </Container>
          )}
          {/* <Container paddingHorizontal="lg">
            <MetricGrid
              title={t("features.host.dashboard.main.overview")}
              items={metricItems}
              columns={2}
            />
         
          </Container> */}
        </Container>
      </ScrollView>

      {/* <EarningsModal
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
      /> */}
      {/* <SetupScreen
        visible={showHostSetup}
        onClose={() => setShowHostSetup(false)}
        onSetupComplete={() => {
          setShowHostSetup(false);
          handleRefresh();
        }}
      /> */}
    </Container>
  );
}
