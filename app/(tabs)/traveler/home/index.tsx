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

// Base components
import { Container, Text, Button, AnimatedContainer } from "@shared/components";

// Module components
import { HorizontalListingsCarousel } from "@modules/properties";

// Utils
import { userUtils } from "@shared/utils";

// Constants
import { spacing, radius } from "@core/design";
import { Skeleton } from "@rneui/base/dist";
import { t } from "i18next";

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
  const [carouselStatus, setCarouselStatus] = React.useState({
    ny: "loading",
    sav: "loading",
    bk: "loading",
  });
  const [retryKey, setRetryKey] = React.useState(0);

  const handleStatusChange = (
    key: "ny" | "sav" | "bk",
    status: "loading" | "success" | "error"
  ) => {
    setCarouselStatus((prev) => ({ ...prev, [key]: status }));
  };

  const allError =
    carouselStatus.ny === "error" &&
    carouselStatus.sav === "error" &&
    carouselStatus.bk === "error";

  // Helper: are all carousels loading?
  const allLoading =
    carouselStatus.ny === "loading" &&
    carouselStatus.sav === "loading" &&
    carouselStatus.bk === "loading";

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

        {/* Content Section */}
        <Container>
          <HorizontalListingsCarousel
            key={`ny-${retryKey}`}
            city="New York"
            onStatusChange={(status) => handleStatusChange("ny", status)}
          />
          <HorizontalListingsCarousel
            key={`sav-${retryKey}`}
            city="Savannah"
            onStatusChange={(status) => handleStatusChange("sav", status)}
          />
          <HorizontalListingsCarousel
            key={`bk-${retryKey}`}
            city="Brooklyn"
            onStatusChange={(status) => handleStatusChange("bk", status)}
          />
        </Container>
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
