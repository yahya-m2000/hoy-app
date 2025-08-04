/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React, { useState, useEffect } from "react";
import { ScrollView, Image, TouchableOpacity, Platform } from "react-native";

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
    minimumLoadingTime: 1000,
    transitionDuration: 800,
    transitionDelay: 200,
  });

  // Share tab bar opacity with the layout
  React.useEffect(() => {
    setTabBarOpacity(tabBarOpacity);
  }, [tabBarOpacity]);

  // Debug master loading state
  console.log("🏠 Master Loading Debug:", {
    loadingCities,
    isMasterLoading,
    isAllLoaded,
    shouldRenderContent,
    topCitiesCount: topCities.length,
  });

  // Check if we have data and it's loaded
  const isContentReady = isAllLoaded && trendingCities && trendingCities.length > 0;

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
            {/* Header Skeleton - matches real header dimensions */}
            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="md"
              paddingVertical="sm"
              style={{ 
                paddingTop: insets.top + spacing.sm,
                minHeight: 56 + insets.top // Match header minHeight
              }}
            >
              <Skeleton
                height={24}
                width={80}
                style={{
                  borderRadius: 6,
                  backgroundColor: theme.colors.gray[100],
                }}
                skeletonStyle={{ backgroundColor: theme.skeleton }}
              />
              <Skeleton
                height={24}
                width={24}
                style={{
                  borderRadius: 4,
                  backgroundColor: theme.colors.gray[100],
                }}
                skeletonStyle={{ backgroundColor: theme.skeleton }}
              />
            </Container>
            
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              contentInsetAdjustmentBehavior="automatic"
            >
              {/* Content Header Section Skeleton */}
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal="md"
                paddingVertical="md"
              >
                <Container>
                  <Skeleton
                    height={28}
                    width={200}
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.gray[100],
                      marginBottom: spacing.xs,
                    }}
                    skeletonStyle={{ backgroundColor: theme.skeleton }}
                  />
                  <Skeleton
                    height={16}
                    width={150}
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.gray[100],
                    }}
                    skeletonStyle={{ backgroundColor: theme.skeleton }}
                  />
                </Container>
                <Skeleton
                  height={32}
                  width={80}
                  style={{
                    borderRadius: 16,
                    backgroundColor: theme.colors.gray[100],
                  }}
                  skeletonStyle={{ backgroundColor: theme.skeleton }}
                />
              </Container>

              {/* Carousel Skeletons */}
              {Array.from({ length: 3 }).map((_, idx) => (
                <Container key={`carousel-skeleton-${idx}`} marginVertical="md">
                  {/* Header skeleton */}
                  <Container
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom="md"
                    marginHorizontal="md"
                  >
                    <Skeleton
                      height={20}
                      width={200}
                      style={{
                        borderRadius: 8,
                        backgroundColor: theme.colors.gray[100],
                      }}
                      skeletonStyle={{ backgroundColor: theme.skeleton }}
                    />
                  </Container>
                  {/* Cards skeleton */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.md }}
                  >
                    {Array.from({ length: 3 }).map((_, cardIdx) => (
                      <Container
                        key={`carousel-skeleton-${idx}-card-${cardIdx}`}
                        style={{ marginRight: spacing.md }}
                      >
                        <PropertyCardSkeleton variant="collection" />
                      </Container>
                    ))}
                  </ScrollView>
                </Container>
              ))}
            </ScrollView>
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
                  notificationCount > 0 ? "notifications" : "notifications-outline",
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
                      {t("features.home.content.greetings.discoverAmazingPlaces")}
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