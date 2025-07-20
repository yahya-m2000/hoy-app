/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React from "react";
import { ScrollView, Image, TouchableOpacity, Platform } from "react-native";

// Expo and third-party libraries
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// App context and hooks
import { useAuth, useToast, useLocation } from "src/core/context";
import { useTheme } from "src/core/hooks/useTheme";
import { useCurrentUser } from "src/features/user/hooks";
import { useTrendingCities } from "src/features/properties/hooks/useTrendingCities";
import { useProperties } from "src/features/properties/hooks/useProperties";

// Base components
import { Container, Text, Button, AnimatedContainer } from "@shared/components";

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
            {t("location.enable")}
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
            {t("location.disable")}
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
            {t("location.auto")}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
      onPress={() => {
        console.log("🧪 Generating test toasts...");
        showToast({
          message: "Test Toast 1 - This is the first test message",
          type: "success",
        });
        setTimeout(() => {
          showToast({
            message:
              "Test Toast 2 - This is the second test message",
            type: "warning",
          });
        }, 500);
        setTimeout(() => {
          showToast({
            message:
              "Test Toast 3 - This is the third test message",
            type: "error",
          });
        }, 1000);
      }}
      style={{
        backgroundColor: theme.colors.warning,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 4,
      }}
    >
      <Text size="xs" color="white" weight="medium">
        Test Toasts
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => {
        console.log("🧪 Manually triggering skipToNextToast...");
        skipToNextToast();
      }}
      style={{
        backgroundColor: theme.colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 4,
      }}
    >
      <Text size="xs" color="white" weight="medium">
        Skip Toast
      </Text>
    </TouchableOpacity> */}
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
            : t("location.locationDebug")}
        </Text>
      </TouchableOpacity>
    </>
  );
};

function HorizontalListingsCarouselWithData({
  city,
  onStatusChange,
}: {
  city: string;
  onStatusChange: (status: "loading" | "success" | "error") => void;
}) {
  const { properties, loading, error } = useProperties({ city });
  return (
    <HorizontalListingsCarousel
      city={city}
      properties={properties}
      loading={loading}
      error={error}
      onStatusChange={onStatusChange}
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

  const router = useRouter();

  // Track status of each carousel
  const [carouselStatus, setCarouselStatus] = React.useState<{
    [city: string]: "loading" | "success" | "error";
  }>({});
  const [retryKey, setRetryKey] = React.useState(0);

  const handleStatusChange = (
    city: string,
    status: "loading" | "success" | "error"
  ) => {
    setCarouselStatus((prev) => ({ ...prev, [city]: status }));
  };

  // Helper: are all carousels loading?
  const allLoading =
    Object.keys(carouselStatus).length > 0 &&
    Object.values(carouselStatus).every((status) => status === "loading");

  // Helper: are all carousels error?
  const allError =
    Object.keys(carouselStatus).length > 0 &&
    Object.values(carouselStatus).every((status) => status === "error");

  // Trending cities
  const {
    trendingCities,
    loading: loadingCities,
    error: trendingCitiesError,
    refetch: refetchTrendingCities,
  } = useTrendingCities();
  const cityNames = trendingCities.map((c) => c.city);
  // const { cityPropertiesMap, loadingMap, errorMap } =
  //   useCityPropertiesMap(cityNames);

  // Handle sign in button press
  const handleSignInPress = () => {
    router.push("/(auth)/sign-in");
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
            {t("home.cannotConnect")}
          </Text>
        </Container>
        <Container marginBottom="lg">
          <Text size="md">{t("home.pleaseTryAgainLater")}</Text>
        </Container>
        <Button
          title="Retry"
          onPress={() => {
            setRetryKey((k) => k + 1);
            setCarouselStatus({ ny: "loading", sav: "loading", bk: "loading" });
          }}
        />
      </Container>
    );
  }

  // Debug: log trendingCities before rendering carousels
  console.log("trendingCities at render:", trendingCities);
  return (
    <Container
      flex={1}
      backgroundColor={isDark ? theme.colors.gray[900] : theme.colors.gray[50]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Logo Section */}
        <Container
          alignItems="center"
          marginTop={Platform.OS === "android" ? "xxl" : "md"}
        >
          <Image
            source={require("../../../../assets/image.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Container>

        {/* Header Section */}
        {allLoading || allError ? (
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="md"
            paddingVertical="md"
          >
            <Skeleton
              height={28}
              width={120}
              style={{
                borderRadius: 8,
                backgroundColor: theme.colors.gray[100],
              }}
              skeletonStyle={{ backgroundColor: theme.skeleton }}
            />
            <Skeleton
              height={28}
              width={80}
              style={{
                borderRadius: 8,
                backgroundColor: theme.colors.gray[100],
              }}
              skeletonStyle={{ backgroundColor: theme.skeleton }}
            />
          </Container>
        ) : (
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
                  {t("home.hello")},{" "}
                  {userUtils.getGreeting(isAuthenticated, user)}
                </Text>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  weight="medium"
                >
                  {t("home.discoverAmazingPlaces")}
                </Text>
              </Container>

              {!isAuthenticated && (
                <Button
                  title={t("home.signIn")}
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
        )}

        {/* Dynamic Carousels for Top Trending Cities or Skeletons */}
        {loadingCities || trendingCities.length === 0
          ? // Show up to 10 carousel skeletons, each with 4 PropertyCardSkeletons in a horizontal scroll
            Array.from({ length: 10 }).map((_, idx) => (
              <ScrollView
                key={`carousel-skeleton-${idx}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 24 }}
                contentContainerStyle={{ paddingHorizontal: spacing.md }}
              >
                {Array.from({ length: 4 }).map((_, cardIdx) => (
                  <Container
                    key={`carousel-skeleton-${idx}-card-${cardIdx}`}
                    style={{ marginRight: spacing.md }}
                  >
                    <PropertyCardSkeleton variant="large" />
                  </Container>
                ))}
              </ScrollView>
            ))
          : trendingCities
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .slice(0, 10)
              .map((city, idx) => (
                <HorizontalListingsCarouselWithData
                  key={`carousel-${city.city}-${idx}`}
                  city={city.city}
                  onStatusChange={(status) =>
                    handleStatusChange(city.city, status)
                  }
                />
              ))}
      </ScrollView>
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
