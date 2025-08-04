/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  View,
  Text as RNText,
} from "react-native";

// Expo and third-party libraries
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// App context and hooks
import { useAuth, useToast, useLocation } from "src/core/context";
import { useTheme } from "src/core/hooks/useTheme";
import { useCurrentUser } from "src/features/user/hooks";
import { useTrendingCities } from "src/features/properties/hooks/useTrendingCities";
import { useProperties } from "src/features/properties/hooks/useProperties";

// Base components
import {
  Container,
  Text,
  Button,
  AnimatedContainer,
  Icon,
  Screen,
  Header,
} from "@shared/components";

// Loading components
import { FadeTransition } from "@shared/components/feedback/Loading";
import { useCoordinatedLoading } from "@shared/hooks/useCoordinatedLoading";
import { setTabBarOpacity } from "@shared/stores/coordinatedLoadingStore";

// Services
import { notificationService } from "@core/services/notification.service";

// Module components
import { HorizontalListingsCarousel } from "@modules/properties";
import PropertyCardSkeleton from "@shared/components/feedback/Loading/PropertyCardSkeleton";
import { PropertyCard } from "src/features/properties/components/cards/PropertyCard";

// Utils
import { userUtils } from "@shared/utils";

// Constants
import { spacing, radius } from "@core/design";
import { Skeleton } from "@rneui/base/dist";
import { t } from "i18next";
import { getEnv } from "src/core/config/environment";

const DebugLocation = () => {
  const { theme } = useTheme();

  const { showToast, skipToNextToast } = useToast();
  const {
    permissionStatus,
    latitude,
    longitude,
    address,
    isLoading,
    locationServicesEnabled,
    manualOverride,
    requestLocationPermission,
    getCurrentLocation,
    checkLocationServices,
    setLocationServicesOverride,
    resetLocationServicesOverride,
  } = useLocation();
  return (
    <>
      <Container flexDirection="row" alignItems="center" marginRight="sm">
        <TouchableOpacity
          onPress={() => setLocationServicesOverride(true)}
          style={{
            backgroundColor:
              manualOverride === true
                ? theme.colors.success
                : theme.colors.gray[300],
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginRight: 4,
          }}
        >
          <Text
            size="xs"
            color={manualOverride === true ? "white" : "black"}
            weight="medium"
          >
            {t("system.location.enable")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLocationServicesOverride(false)}
          style={{
            backgroundColor:
              manualOverride === false
                ? theme.colors.error
                : theme.colors.gray[300],
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginRight: 4,
          }}
        >
          <Text
            size="xs"
            color={manualOverride === false ? "white" : "black"}
            weight="medium"
          >
            {t("system.location.disable")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => resetLocationServicesOverride()}
          style={{
            backgroundColor:
              manualOverride === null
                ? theme.colors.primary
                : theme.colors.gray[300],
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginRight: 4,
          }}
        >
          <Text
            size="xs"
            color={manualOverride === null ? "white" : "black"}
            weight="medium"
          >
            {t("system.location.auto")}
          </Text>
        </TouchableOpacity>
      </Container>

      <TouchableOpacity
        onPress={async () => {
          console.log("Location debug button pressed");
          console.log("Current permission status:", permissionStatus);
          console.log("Location services enabled:", locationServicesEnabled);
          console.log("Manual override:", manualOverride);

          const servicesEnabled = await checkLocationServices();
          console.log("Location services check result:", servicesEnabled);

          if (permissionStatus !== "granted") {
            console.log("Requesting location permission...");
            const granted = await requestLocationPermission();
            console.log("Permission granted:", granted);
            if (granted) {
              await getCurrentLocation();
            }
          } else {
            console.log("Permission already granted, getting location...");
            await getCurrentLocation();
          }
        }}
        style={{
          backgroundColor:
            locationServicesEnabled === false
              ? theme.colors.error
              : theme.primary,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
        }}
        disabled={isLoading}
      >
        <Text size="sm" color="white" weight="medium">
          {isLoading
            ? "..."
            : locationServicesEnabled === false
            ? "Location Disabled"
            : t("system.location.locationDebug")}
        </Text>
      </TouchableOpacity>
    </>
  );
};

// Component wrapper that uses hooks properly
function CityCarousel({ city }: { city: string }) {
  const { properties, loading, error } = useProperties({ city });

  return (
    <HorizontalListingsCarousel
      city={city}
      properties={properties}
      loading={loading}
      error={error}
    />
  );
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const { showToast, skipToNextToast } = useToast();
  const {
    permissionStatus,
    latitude,
    longitude,
    address,
    isLoading,
    locationServicesEnabled,
    manualOverride,
    requestLocationPermission,
    getCurrentLocation,
    checkLocationServices,
    setLocationServicesOverride,
    resetLocationServicesOverride,
  } = useLocation();

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Notification state
  const [notificationCount, setNotificationCount] = useState(0);

  // Setup notification listeners
  useEffect(() => {
    const updateNotificationCount = () => {
      setNotificationCount(notificationService.getUnreadCount());
    };

    // Update count initially
    updateNotificationCount();

    // Setup notification listeners
    const cleanup = notificationService.setupNotificationListeners(
      (notification) => {
        // Update count when notification received
        updateNotificationCount();
      },
      (response) => {
        // Handle notification tap - navigate to inbox screen
        router.push("/(tabs)/traveler/inbox");
      }
    );

    return cleanup;
  }, [router]);

  // Master data fetching - home screen controls everything
  const {
    trendingCities,
    loading: loadingCities,
    error: trendingCitiesError,
    refetch: refetchTrendingCities,
  } = useTrendingCities();

  // Fetch properties for each trending city
  const topCities = React.useMemo(() => {
    if (!trendingCities) return [];
    return trendingCities
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10);
  }, [trendingCities]);

  // For now, let's use a simpler approach without conditional hooks
  // We'll just track the trending cities loading state and let carousels load independently
  // but coordinate them with the master loading state

  // Master loading state - start with cities loading
  const isMasterLoading = loadingCities;

  // Coordinated loading system with single master state
  const {
    isAllLoaded,
    skeletonOpacity,
    contentOpacity,
    tabBarOpacity,
    shouldRenderContent,
  } = useCoordinatedLoading([isMasterLoading], {
    minimumLoadingTime: 2000, // 2 seconds for demo
    transitionDuration: 800,
    transitionDelay: 200,
  });

  // Share tab bar opacity with the layout
  React.useEffect(() => {
    console.log("🏠 Setting tab bar opacity:", tabBarOpacity.value);
    setTabBarOpacity(tabBarOpacity);
  }, [tabBarOpacity]);

  // Debug master loading state
  React.useEffect(() => {
    console.log("🏠 Master Loading Debug:", {
      loadingCities,
      isMasterLoading,
      isAllLoaded,
      shouldRenderContent,
      topCitiesCount: topCities.length,
      skeletonOpacity: skeletonOpacity.value,
      contentOpacity: contentOpacity.value,
      tabBarOpacity: tabBarOpacity.value,
    });
  }, [isMasterLoading, isAllLoaded, shouldRenderContent]);

  // Debug what's being rendered
  console.log("🏠 RENDER DEBUG:", {
    isMasterLoading,
    willShowDebugContainer: isMasterLoading,
    themeBackground: theme.background,
  });

  // Check if we have data and it's loaded
  const isContentReady =
    isAllLoaded && trendingCities && trendingCities.length > 0;

  // Helper: check for errors
  const allError = trendingCitiesError;

  // Handle sign in button press
  const handleSignInPress = () => {
    router.push("/(auth)/sign-in");
  };

  // Handle notification bell press
  const handleNotificationPress = () => {
    router.push("/(tabs)/traveler/inbox");
  };

  if (allError) {
    return (
      <Container
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="xl"
        backgroundColor="#fff"
      >
        <Container marginBottom="md">
          <Text size="xl" weight="medium">
            {t("features.home.content.errors.cannotConnect")}
          </Text>
        </Container>
        <Container marginBottom="lg">
          <Text size="md">
            {t("features.home.content.errors.pleaseTryAgainLater")}
          </Text>
        </Container>
        <Button
          title="Retry"
          onPress={() => {
            refetchTrendingCities();
            // Properties will be refetched automatically when cities change
          }}
        />
      </Container>
    );
  }

  return (
    <Container backgroundColor={theme.background} flex={1}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Use FadeTransition for coordinated loading of entire screen */}
      <FadeTransition
        skeletonOpacity={skeletonOpacity}
        contentOpacity={contentOpacity}
        shouldRenderContent={shouldRenderContent}
        skeleton={
          <Container flex={1}>
            {/* Header Skeleton - matches real header dimensions and layout */}
            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="lg"
              paddingVertical="sm"
              style={{
                paddingTop: insets.top + spacing.sm,
                minHeight: 56 + insets.top, // Match header minHeight
              }}
            >
              {/* Left section - empty to match real header */}
              <Container flex={1} />

              {/* Center section - App title skeleton */}
              <Container flex={2} alignItems="center">
                <Skeleton
                  animation="pulse"
                  height={24}
                  width={100}
                  style={{
                    borderRadius: 6,
                    backgroundColor: theme.colors.gray[100],
                  }}
                  skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                />
              </Container>

              {/* Right section - Notification bell skeleton */}
              <Container flex={1} alignItems="flex-end">
                <Skeleton
                  animation="pulse"
                  height={28}
                  width={28}
                  style={{
                    borderRadius: 14,
                    backgroundColor: theme.colors.gray[100],
                  }}
                  skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                />
              </Container>
            </Container>

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="md"
              paddingVertical="md"
            >
              <Container>
                <Skeleton
                  animation="pulse"
                  height={28}
                  width={200}
                  style={{
                    borderRadius: 8,
                    backgroundColor: theme.colors.gray[100],
                    marginBottom: spacing.xs,
                  }}
                  skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                />
                <Skeleton
                  animation="pulse"
                  height={16}
                  width={150}
                  style={{
                    borderRadius: 8,
                    backgroundColor: theme.colors.gray[100],
                  }}
                  skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                />
              </Container>
              <Skeleton
                animation="pulse"
                height={32}
                width={80}
                style={{
                  borderRadius: 16,
                  backgroundColor: theme.colors.gray[100],
                }}
                skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
              />
            </Container>

            <Container flex={1}>
              <Container marginVertical="md">
                {/* Carousel 1 */}
                <Container
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="md"
                  marginHorizontal="md"
                >
                  <Skeleton
                    animation="pulse"
                    height={20}
                    width={200}
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.gray[100],
                    }}
                    skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                  />
                </Container>
              </Container>

              <Container marginVertical="md">
                {/* Carousel 2 */}
                <Container
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="md"
                  marginHorizontal="md"
                >
                  <Skeleton
                    animation="pulse"
                    height={20}
                    width={200}
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.gray[100],
                    }}
                    skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                  />
                </Container>
                <Container flexDirection="row" paddingHorizontal="md">
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                </Container>
              </Container>

              <Container marginVertical="md">
                {/* Carousel 3 */}
                <Container
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="md"
                  marginHorizontal="md"
                >
                  <Skeleton
                    animation="pulse"
                    height={20}
                    width={200}
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.gray[100],
                    }}
                    skeletonStyle={{ backgroundColor: theme.colors.gray[100] }}
                  />
                </Container>
                <Container flexDirection="row" paddingHorizontal="md">
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                  <Container style={{ marginRight: spacing.md }}>
                    <PropertyCardSkeleton variant="collection" />
                  </Container>
                </Container>
              </Container>
            </Container>
          </Container>
        }
        content={
          <Container flex={1}>
            {/* Real Header */}
            <Header
              title="Hoybnb"
              titleStyle={{ fontWeight: "900", fontSize: 24 }}
              right={{
                icon:
                  notificationCount > 0
                    ? "notifications"
                    : "notifications-outline",
                onPress: handleNotificationPress,
              }}
              showDivider={false}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              contentInsetAdjustmentBehavior="automatic"
            >
              {/* Header Section */}
              <Container
                marginBottom="lg"
                style={{
                  borderRadius: radius.lg,
                  paddingVertical: spacing.md,
                  marginHorizontal: spacing.md,
                }}
              >
                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Container>
                    <Text
                      variant="h6"
                      weight="bold"
                      color={theme.text.primary}
                      style={{ marginBottom: 2 }}
                    >
                      {t("features.home.content.greetings.hello")},{" "}
                      {userUtils.getGreeting(isAuthenticated, user)}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.text.secondary}
                      weight="medium"
                    >
                      {t(
                        "features.home.content.greetings.discoverAmazingPlaces"
                      )}
                    </Text>
                  </Container>

                  {!isAuthenticated && (
                    <Button
                      title={t("features.home.content.auth.signIn")}
                      onPress={handleSignInPress}
                      variant="outline"
                      size="small"
                      style={{
                        backgroundColor: isDark
                          ? theme.colors.gray[800]
                          : theme.colors.gray[100],
                        borderColor: isDark
                          ? theme.colors.gray[600]
                          : theme.colors.gray[300],
                      }}
                    />
                  )}
                </Container>
              </Container>

              {/* Dynamic Carousels for Top Trending Cities */}
              {topCities.map((city, idx) => (
                <CityCarousel
                  key={`carousel-${city.city}-${idx}`}
                  city={city.city}
                />
              ))}
            </ScrollView>
          </Container>
        }
      />
    </Container>
  );
}

const styles = {
  // Content
  content: {
    paddingBottom: spacing.xxl,
  },

  // Logo
  logo: {
    width: 120,
    height: 30,
  },
};
